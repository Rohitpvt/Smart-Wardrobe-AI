"""
Clerk Webhook Endpoint.

Handles user.created, user.updated, user.deleted events from Clerk.
Verifies webhook signature using Svix/CLERK_WEBHOOK_SECRET.
"""
import logging
import json

from fastapi import APIRouter, Request, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from fastapi import Depends

from app.core.config import settings
from app.core.database import get_db
from app.models import User

logger = logging.getLogger(__name__)

router = APIRouter()


def _verify_webhook_signature(payload: bytes, headers: dict) -> dict:
    """Verify Clerk webhook signature using Svix."""
    from svix.webhooks import Webhook, WebhookVerificationError

    secret = settings.CLERK_WEBHOOK_SECRET
    if not secret:
        raise HTTPException(status_code=500, detail="Webhook secret not configured")

    try:
        wh = Webhook(secret)
        return wh.verify(payload, headers)
    except WebhookVerificationError:
        logger.warning("[CLERK_WEBHOOK] Signature verification failed")
        raise HTTPException(status_code=400, detail="Invalid webhook signature")


@router.post("/webhooks/clerk")
async def clerk_webhook(request: Request, db: AsyncSession = Depends(get_db)):
    """Handle Clerk webhook events."""
    payload = await request.body()

    # Svix requires specific headers for verification
    svix_headers = {
        "svix-id": request.headers.get("svix-id", ""),
        "svix-timestamp": request.headers.get("svix-timestamp", ""),
        "svix-signature": request.headers.get("svix-signature", ""),
    }

    event = _verify_webhook_signature(payload, svix_headers)

    event_type = event.get("type", "")
    data = event.get("data", {})

    if event_type == "user.created":
        await _handle_user_created(data, db)
    elif event_type == "user.updated":
        await _handle_user_updated(data, db)
    elif event_type == "user.deleted":
        await _handle_user_deleted(data, db)
    else:
        logger.info(f"[CLERK_WEBHOOK] Unhandled event type: {event_type}")

    return {"status": "ok"}


async def _handle_user_created(data: dict, db: AsyncSession):
    """Create local user metadata if not already linked."""
    clerk_user_id = data.get("id")
    if not clerk_user_id:
        return

    # Check if already exists
    result = await db.execute(
        select(User).where(User.clerk_user_id == clerk_user_id)
    )
    if result.scalar_one_or_none():
        return  # Already linked

    email = _extract_primary_email(data)
    first_name = data.get("first_name", "") or "User"
    last_name = data.get("last_name", "") or ""
    avatar_url = data.get("image_url", "")

    # Check if existing user with same email (migration linking)
    if email:
        result = await db.execute(select(User).where(User.email == email))
        existing_user = result.scalar_one_or_none()
        if existing_user:
            existing_user.clerk_user_id = clerk_user_id
            existing_user.auth_provider = "clerk"
            existing_user.email_verified = True
            db.add(existing_user)
            await db.commit()
            logger.info(f"[CLERK_WEBHOOK] Linked existing user to Clerk via webhook")
            return

    # Create new user
    new_user = User(
        email=email or f"{clerk_user_id}@clerk.placeholder",
        clerk_user_id=clerk_user_id,
        auth_provider="clerk",
        email_verified=bool(email),
        first_name=first_name,
        last_name=last_name,
        avatar_url=avatar_url or None,
        onboarding_completed=False,
        is_active=True,
    )
    db.add(new_user)
    await db.commit()
    logger.info(f"[CLERK_WEBHOOK] Created local user from Clerk webhook")


async def _handle_user_updated(data: dict, db: AsyncSession):
    """Update safe metadata for an existing user."""
    clerk_user_id = data.get("id")
    if not clerk_user_id:
        return

    result = await db.execute(
        select(User).where(User.clerk_user_id == clerk_user_id)
    )
    user = result.scalar_one_or_none()
    if not user:
        return

    email = _extract_primary_email(data)
    if email:
        user.email = email
        user.email_verified = True
    if data.get("first_name"):
        user.first_name = data["first_name"]
    if data.get("last_name"):
        user.last_name = data["last_name"]
    if data.get("image_url"):
        user.avatar_url = data["image_url"]

    db.add(user)
    await db.commit()
    logger.info(f"[CLERK_WEBHOOK] Updated user metadata from Clerk webhook")


async def _handle_user_deleted(data: dict, db: AsyncSession):
    """Soft-delete user: deactivate account and revoke BYOK keys."""
    clerk_user_id = data.get("id")
    if not clerk_user_id:
        return

    result = await db.execute(
        select(User).where(User.clerk_user_id == clerk_user_id)
    )
    user = result.scalar_one_or_none()
    if not user:
        return

    # Soft-delete: mark as inactive
    user.is_active = False

    # Revoke BYOK keys for security (deactivate and clear key data)
    from app.models.user_ai_provider_key import UserAiProviderKey
    key_result = await db.execute(
        select(UserAiProviderKey).where(UserAiProviderKey.user_id == user.id)
    )
    for key in key_result.scalars().all():
        key.encrypted_api_key = ""
        key.is_active = False
        db.add(key)

    db.add(user)
    await db.commit()
    logger.info(f"[CLERK_WEBHOOK] Deactivated user and revoked BYOK keys via webhook")


def _extract_primary_email(data: dict) -> str:
    """Extract primary email from Clerk user data."""
    email_addresses = data.get("email_addresses", [])
    for ea in email_addresses:
        if ea.get("id") == data.get("primary_email_address_id"):
            return (ea.get("email_address", "") or "").strip().lower()
    # Fallback to first email
    if email_addresses:
        return (email_addresses[0].get("email_address", "") or "").strip().lower()
    return ""
