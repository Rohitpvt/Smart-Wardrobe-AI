import logging
from uuid import UUID
from datetime import datetime, timezone, time
from sqlalchemy.orm import Session
from sqlalchemy import select, func, and_, desc
from fastapi import HTTPException
from starlette.status import HTTP_403_FORBIDDEN

from app.models.ai_usage import AIUsageEvent
from app.core.config import settings

logger = logging.getLogger(__name__)


from sqlalchemy.ext.asyncio import AsyncSession

class AIQuotaExceededException(HTTPException):
    """Exception raised when a user exceeds their daily AI limit."""
    def __init__(self, plan_meta: dict, current_usage: int):
        super().__init__(
            status_code=HTTP_403_FORBIDDEN,
            detail={
                "status": "provider_required",
                "message": "You have reached your daily AI limit.",
                "action": "quota_exceeded",
                "plan": plan_meta["plan"],
                "effective_plan": plan_meta["effective_plan"],
                "limit_count": plan_meta["limit_count"],
                "current_usage": current_usage,
                "remaining": max(0, plan_meta["limit_count"] - current_usage) if plan_meta["limit_count"] else 0,
                "upgrade_available": plan_meta["upgrade_available"]
            }
        )


def _get_utc_day_boundaries() -> tuple[datetime, datetime]:
    """Returns the start and end of the current UTC day."""
    now = datetime.now(timezone.utc)
    start_of_day = datetime.combine(now.date(), time.min).replace(tzinfo=timezone.utc)
    end_of_day = datetime.combine(now.date(), time.max).replace(tzinfo=timezone.utc)
    return start_of_day, end_of_day


from app.models.user import User
from app.services.ai_plan_quota_policy_service import get_user_quota_policy

async def check_quota(db: AsyncSession, user_id: UUID) -> None:
    """
    Checks if the user has reached their daily AI limit based on their plan.
    Raises AIQuotaExceededException if exceeded.
    """
    if not settings.PLATFORM_AI_QUOTA_ENABLED:
        return

    # Lock the user row for this transaction to serialize concurrent AI requests
    result = await db.execute(select(User).where(User.id == user_id).with_for_update())
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    policy = get_user_quota_policy(user)

    if policy["is_unlimited"]:
        return

    start_of_day, end_of_day = _get_utc_day_boundaries()

    # Count requests that consumed quota ("started", "success", "fallback_success")
    stmt = select(func.count(AIUsageEvent.id)).where(
        and_(
            AIUsageEvent.user_id == user_id,
            AIUsageEvent.created_at >= start_of_day,
            AIUsageEvent.created_at <= end_of_day,
            AIUsageEvent.status.in_(["started", "success", "fallback_success"])
        )
    )
    
    usage_count = (await db.execute(stmt)).scalar() or 0

    if usage_count >= policy["limit_count"]:
        raise AIQuotaExceededException(plan_meta=policy, current_usage=usage_count)


async def reserve_usage(
    db: AsyncSession, 
    user_id: UUID, 
    feature_name: str, 
    provider: str, 
    credential_source: str, 
    model_name: str
) -> UUID:
    """
    Checks quota and creates a 'started' event to prevent parallel bypass.
    Raises AIQuotaExceededException if quota is exceeded.
    """
    # 1. Check quota
    await check_quota(db, user_id)

    # 2. Reserve quota
    event = AIUsageEvent(
        user_id=user_id,
        feature_name=feature_name,
        provider=provider,
        credential_source=credential_source,
        model_name=model_name,
        status="started"
    )
    db.add(event)
    await db.commit()
    await db.refresh(event)
    
    return event.id


async def finalize_usage(
    db: AsyncSession,
    usage_event_id: UUID,
    status: str,
    input_tokens: int | None = None,
    output_tokens: int | None = None,
    total_tokens: int | None = None,
    latency_ms: float | None = None,
    error_code: str | None = None
) -> None:
    """
    Updates the reserved usage event with final token counts, latency, and status.
    """
    event = await db.get(AIUsageEvent, usage_event_id)
    if not event:
        logger.warning(f"[AI_QUOTA] Attempted to finalize unknown usage event {usage_event_id}")
        return

    event.status = status
    event.input_tokens = input_tokens
    event.output_tokens = output_tokens
    event.total_tokens = total_tokens
    event.latency_ms = latency_ms
    event.error_code = error_code

    from app.services.ai_cost_estimator import calculate_cost
    event.estimated_cost = calculate_cost(event.provider, input_tokens, output_tokens)

    await db.commit()


async def get_usage_summary(db: AsyncSession, user_id: UUID) -> dict:
    """
    Returns the user's daily usage summary, plan details, and recent events.
    """
    start_of_day, end_of_day = _get_utc_day_boundaries()
    
    # Fetch User & Policy
    user = (await db.execute(select(User).where(User.id == user_id))).scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    policy = get_user_quota_policy(user)
    
    # Get current usage count
    stmt = select(func.count(AIUsageEvent.id)).where(
        and_(
            AIUsageEvent.user_id == user_id,
            AIUsageEvent.created_at >= start_of_day,
            AIUsageEvent.created_at <= end_of_day,
            AIUsageEvent.status.in_(["started", "success", "fallback_success"])
        )
    )
    used = (await db.execute(stmt)).scalar() or 0
    limit = policy["limit_count"]
    
    # Get 10 most recent events
    recent_stmt = select(AIUsageEvent).where(
        AIUsageEvent.user_id == user_id
    ).order_by(desc(AIUsageEvent.created_at)).limit(10)
    
    recent_events = (await db.execute(recent_stmt)).scalars().all()
    
    events_data = []
    for event in recent_events:
        events_data.append({
            "id": str(event.id),
            "feature_name": event.feature_name,
            "provider": event.provider,
            "status": event.status,
            "created_at": event.created_at.isoformat(),
            "input_tokens": event.input_tokens,
            "output_tokens": event.output_tokens,
            "total_tokens": event.total_tokens,
            "latency_ms": event.latency_ms,
            "credential_source": event.credential_source
        })
        
    return {
        "plan": policy["plan"],
        "effective_plan": policy["effective_plan"],
        "limit_count": limit,
        "current_usage": used,
        "remaining": None if policy["is_unlimited"] else max(0, limit - used),
        "is_unlimited": policy["is_unlimited"],
        "upgrade_available": policy["upgrade_available"],
        "reset_time": end_of_day.isoformat(),
        "recent_events": events_data
    }
