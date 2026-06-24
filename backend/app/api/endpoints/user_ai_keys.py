import logging
from datetime import datetime, timezone
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.core.database import get_db
from app.models import User
from app.models.user_ai_provider_key import UserAiProviderKey
from app.api.dependencies import get_current_user
from app.services.user_ai_key_encryption_service import encryption_service
from app.services.ai.gemini_provider import GeminiProvider

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/user-ai-keys", tags=["User AI Keys"])

class GeminiKeyInput(BaseModel):
    api_key: str = Field(..., min_length=10)

class GeminiKeyStatus(BaseModel):
    connected: bool
    key_fingerprint: str | None = None
    last_verified_at: datetime | None = None
    last_used_at: datetime | None = None
    last_error: str | None = None

class StatusResponse(BaseModel):
    gemini: GeminiKeyStatus

async def _test_gemini_key(api_key: str) -> tuple[bool, str | None]:
    """
    Test the Gemini API key by making a minimal request.
    Returns (is_valid, error_message).
    - (True, None) → key is valid and working
    - (False, "invalid") → key is invalid (auth error)
    - (False, "transient") → key might be valid but Google API is temporarily unavailable
    """
    try:
        provider = GeminiProvider(api_key=api_key)
        # Call generate_text with a minimal prompt
        res, _ = await provider.generate_text(
            prompt="Reply 'OK'",
            temperature=0.1,
            timeout=15.0
        )
        return (True, None) if ("ok" in res.lower() or len(res) > 0) else (False, "invalid")
    except Exception as e:
        error_str = str(e).lower()
        logger.error(f"Failed to verify Gemini API key: {type(e).__name__}: {e}")

        # Auth/permission errors → key is definitely invalid
        if any(kw in error_str for kw in [
            "api key not valid", "invalid api key", "api_key_invalid",
            "401", "403", "unauthorized", "forbidden", "permission_denied",
            "invalid_argument", "400",
        ]):
            return (False, "invalid")

        # Transient errors → key might be valid, Google API is temporarily down
        if any(kw in error_str for kw in [
            "503", "429", "unavailable", "overloaded", "rate_limit",
            "resource_exhausted", "high demand", "quota", "timeout",
            "502", "504", "bad gateway", "gateway timeout",
        ]):
            return (False, "transient")

        # Unknown error → treat as invalid to be safe
        return (False, "invalid")

@router.get("/status", response_model=StatusResponse)
async def get_key_status(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(UserAiProviderKey).where(
        UserAiProviderKey.user_id == current_user.id,
        UserAiProviderKey.provider == "gemini",
        UserAiProviderKey.is_active == True
    )
    result = await db.execute(stmt)
    key_record = result.scalar_one_or_none()

    if not key_record:
        return StatusResponse(gemini=GeminiKeyStatus(connected=False))

    return StatusResponse(
        gemini=GeminiKeyStatus(
            connected=True,
            key_fingerprint=key_record.key_fingerprint,
            last_verified_at=key_record.last_verified_at,
            last_used_at=key_record.last_used_at,
            last_error=key_record.last_error,
        )
    )

@router.post("/gemini", response_model=StatusResponse)
async def add_gemini_key(
    payload: GeminiKeyInput,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # 1. Test the key
    is_valid, error_type = await _test_gemini_key(payload.api_key)

    if not is_valid and error_type == "invalid":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The provided Gemini API key is invalid or lacks permissions."
        )

    # For transient errors, we accept the key optimistically with a warning
    transient_warning = None
    if not is_valid and error_type == "transient":
        transient_warning = "Key saved but Google API is temporarily unavailable. We'll verify it when you next use an AI feature."
        logger.info("Accepting Gemini key optimistically due to transient Google API error.")

    # 2. Encrypt key
    try:
        encrypted_key = encryption_service.encrypt_key(payload.api_key)
    except Exception as e:
        logger.error(f"Failed to encrypt API key: {e}")
        raise HTTPException(status_code=500, detail="Encryption service error")

    fingerprint = encryption_service.create_fingerprint(payload.api_key)

    # 3. Store/Update key
    stmt = select(UserAiProviderKey).where(
        UserAiProviderKey.user_id == current_user.id,
        UserAiProviderKey.provider == "gemini"
    )
    result = await db.execute(stmt)
    key_record = result.scalar_one_or_none()

    now = datetime.now(timezone.utc)
    if key_record:
        key_record.encrypted_api_key = encrypted_key
        key_record.key_fingerprint = fingerprint
        key_record.is_active = True
        key_record.last_verified_at = now
        key_record.last_error = None
    else:
        key_record = UserAiProviderKey(
            user_id=current_user.id,
            provider="gemini",
            encrypted_api_key=encrypted_key,
            key_fingerprint=fingerprint,
            is_active=True,
            last_verified_at=now
        )
        db.add(key_record)

    await db.commit()

    return StatusResponse(
        gemini=GeminiKeyStatus(
            connected=True,
            key_fingerprint=fingerprint,
            last_verified_at=now,
            last_error=None
        )
    )

@router.post("/gemini/test", response_model=StatusResponse)
async def test_gemini_key(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(UserAiProviderKey).where(
        UserAiProviderKey.user_id == current_user.id,
        UserAiProviderKey.provider == "gemini",
        UserAiProviderKey.is_active == True
    )
    result = await db.execute(stmt)
    key_record = result.scalar_one_or_none()

    if not key_record:
        raise HTTPException(status_code=404, detail="No active Gemini key found.")

    try:
        plain_key = encryption_service.decrypt_key(key_record.encrypted_api_key)
    except Exception:
        raise HTTPException(status_code=500, detail="Failed to decrypt key.")

    is_valid, error_type = await _test_gemini_key(plain_key)
    now = datetime.now(timezone.utc)

    if is_valid:
        key_record.last_verified_at = now
        key_record.last_error = None
    elif error_type == "transient":
        # Don't deactivate key for transient Google API errors
        key_record.last_error = "Google API temporarily unavailable during test."
    else:
        key_record.last_error = "Key validation failed during test."
        key_record.is_active = False # Deactivate key only if it's truly invalid

    await db.commit()

    if not is_valid and error_type == "invalid":
        raise HTTPException(status_code=400, detail="Key validation failed. The key appears to be invalid or revoked.")

    if not is_valid and error_type == "transient":
        raise HTTPException(status_code=503, detail="Google API is temporarily unavailable. Your key is still saved. Please try again later.")

    return StatusResponse(
        gemini=GeminiKeyStatus(
            connected=True,
            key_fingerprint=key_record.key_fingerprint,
            last_verified_at=now,
            last_error=None
        )
    )

@router.delete("/gemini")
async def delete_gemini_key(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(UserAiProviderKey).where(
        UserAiProviderKey.user_id == current_user.id,
        UserAiProviderKey.provider == "gemini"
    )
    result = await db.execute(stmt)
    key_record = result.scalar_one_or_none()

    if key_record:
        await db.delete(key_record)
        await db.commit()

    return {"message": "Key deleted successfully."}
