from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from app.api.dependencies import get_current_user
from app.core.database import get_db
from app.models.user import User
from app.models.user_ai_provider_key import UserAiProviderKey
from app.models.ai_usage import AIUsageEvent
from app.services.ai_usage_quota_service import get_usage_summary
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/ai-usage", tags=["ai-usage"])

@router.get("/me")
async def get_my_usage(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Fetch the AI usage summary for the currently authenticated user.
    Kept for admin/internal compatibility.
    """
    try:
        summary = await get_usage_summary(db, current_user.id)
        return summary
    except Exception as e:
        logger.error(f"Failed to fetch AI usage for {current_user.id}: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.get("/byok-activity")
async def get_byok_activity(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    BYOK-safe AI activity endpoint.
    Returns Gemini key status and recent activity without plan/quota fields.
    """
    try:
        # 1. Get Gemini key status
        stmt = select(UserAiProviderKey).where(
            UserAiProviderKey.user_id == current_user.id,
            UserAiProviderKey.provider == "gemini"
        )
        result = await db.execute(stmt)
        key_record = result.scalar_one_or_none()

        gemini_key_data = {
            "connected": False,
            "key_fingerprint": None,
            "last_verified_at": None,
            "last_used_at": None,
            "last_error": None,
            "is_active": False,
        }

        if key_record:
            gemini_key_data = {
                "connected": key_record.is_active,
                "key_fingerprint": key_record.key_fingerprint,
                "last_verified_at": key_record.last_verified_at.isoformat() if key_record.last_verified_at else None,
                "last_used_at": key_record.last_used_at.isoformat() if key_record.last_used_at else None,
                "last_error": key_record.last_error,
                "is_active": key_record.is_active,
            }

        # 2. Get recent activity (last 20 events)
        activity_stmt = select(AIUsageEvent).where(
            AIUsageEvent.user_id == current_user.id
        ).order_by(desc(AIUsageEvent.created_at)).limit(20)

        events = (await db.execute(activity_stmt)).scalars().all()

        activity = []
        for event in events:
            # Sanitize error_code — never expose raw API keys
            safe_error = None
            if event.error_code:
                err = event.error_code
                # Strip anything that looks like an API key
                if "api_key" in err.lower() or "AIza" in err:
                    safe_error = "API error"
                else:
                    safe_error = err[:100]  # Truncate for safety

            activity.append({
                "id": str(event.id),
                "time": event.created_at.isoformat(),
                "feature": event.feature_name,
                "credential_source": event.credential_source,
                "status": event.status,
                "tokens": event.total_tokens,
                "latency_ms": round(event.latency_ms, 1) if event.latency_ms else None,
                "error": safe_error,
            })

        return {
            "ai_access_mode": "byok",
            "gemini_key": gemini_key_data,
            "activity": activity,
        }

    except Exception as e:
        logger.error(f"Failed to fetch BYOK activity for {current_user.id}: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

