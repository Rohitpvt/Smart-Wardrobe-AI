import logging
from typing import Optional, List, Any
from uuid import UUID
from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_, desc

from app.core.database import get_db
from app.models.user import User
from app.models.ai_usage import AIUsageEvent
from app.api.dependencies import get_admin_user

logger = logging.getLogger(__name__)

router = APIRouter()

@router.get("/summary")
async def get_summary(
    db: AsyncSession = Depends(get_db),
    current_admin: User = Depends(get_admin_user)
):
    now = datetime.now(timezone.utc)
    start_of_today = now.replace(hour=0, minute=0, second=0, microsecond=0)
    start_of_7d = now - timedelta(days=7)
    start_of_30d = now - timedelta(days=30)
    
    # Simple aggregates
    async def get_count_since(dt):
        stmt = select(func.count(AIUsageEvent.id)).where(AIUsageEvent.created_at >= dt)
        return (await db.execute(stmt)).scalar() or 0
        
    total_today = await get_count_since(start_of_today)
    total_7d = await get_count_since(start_of_7d)
    total_30d = await get_count_since(start_of_30d)
    
    # Status metrics
    async def get_status_count(status_name):
        stmt = select(func.count(AIUsageEvent.id)).where(AIUsageEvent.status == status_name)
        return (await db.execute(stmt)).scalar() or 0
        
    success_count = await get_status_count("success")
    failed_count = await get_status_count("failed")
    quota_blocked_count = await get_status_count("quota_blocked")
    fallback_success_count = await get_status_count("fallback_success")
    fallback_failed_count = await get_status_count("fallback_failed")
    fallback_count = fallback_success_count + fallback_failed_count
    
    # Global metrics
    stmt = select(func.avg(AIUsageEvent.latency_ms), func.sum(AIUsageEvent.total_tokens), func.sum(AIUsageEvent.estimated_cost))
    res = (await db.execute(stmt)).first()
    avg_latency = float(res[0]) if res and res[0] else None
    total_tokens = int(res[1]) if res and res[1] else None
    estimated_cost = float(res[2]) if res and res[2] else None
    
    # Provider breakdown
    prov_stmt = select(AIUsageEvent.provider, func.count(AIUsageEvent.id)).group_by(AIUsageEvent.provider)
    providers = [{"provider": row[0], "count": row[1]} for row in (await db.execute(prov_stmt)).all()]
    
    # Feature breakdown
    feat_stmt = select(AIUsageEvent.feature_name, func.count(AIUsageEvent.id)).group_by(AIUsageEvent.feature_name)
    features = [{"feature": row[0], "count": row[1]} for row in (await db.execute(feat_stmt)).all()]
    
    return {
        "total_requests_today": total_today,
        "total_requests_7d": total_7d,
        "total_requests_30d": total_30d,
        "success_count": success_count,
        "failed_count": failed_count,
        "quota_blocked_count": quota_blocked_count,
        "fallback_count": fallback_count,
        "average_latency_ms": avg_latency,
        "total_reported_tokens": total_tokens,
        "estimated_cost": estimated_cost,
        "requests_by_provider": providers,
        "requests_by_feature": features
    }

@router.get("/users")
async def get_users_ranking(
    range_filter: str = Query("30d", alias="range", description="today|7d|30d|all"),
    limit: int = Query(10, ge=1, le=100),
    sort_by: str = Query("requests", alias="sort", description="requests|tokens|blocked|latency|last_used"),
    db: AsyncSession = Depends(get_db),
    current_admin: User = Depends(get_admin_user)
):
    now = datetime.now(timezone.utc)
    filters = []
    if range_filter == "today":
        filters.append(AIUsageEvent.created_at >= now.replace(hour=0, minute=0, second=0, microsecond=0))
    elif range_filter == "7d":
        filters.append(AIUsageEvent.created_at >= now - timedelta(days=7))
    elif range_filter == "30d":
        filters.append(AIUsageEvent.created_at >= now - timedelta(days=30))
        
    stmt = select(
        User.id,
        User.email,
        User.ai_plan,
        User.is_admin,
        func.count(AIUsageEvent.id).label("total_requests"),
        func.sum(func.cast(AIUsageEvent.status.in_(["success", "fallback_success"]), func.cast(func.integer, func.integer))).label("success_requests"),
        func.sum(func.cast(AIUsageEvent.status == "quota_blocked", func.cast(func.integer, func.integer))).label("blocked_requests"),
        func.sum(func.cast(AIUsageEvent.status.in_(["failed", "fallback_failed"]), func.cast(func.integer, func.integer))).label("failed_requests"),
        func.sum(AIUsageEvent.total_tokens).label("total_tokens"),
        func.sum(AIUsageEvent.estimated_cost).label("estimated_cost"),
        func.max(AIUsageEvent.created_at).label("last_used"),
        func.avg(AIUsageEvent.latency_ms).label("avg_latency")
    ).join(User, User.id == AIUsageEvent.user_id)
    
    if filters:
        stmt = stmt.where(and_(*filters))
        
    stmt = stmt.group_by(User.id, User.email, User.ai_plan, User.is_admin)
    
    if sort_by == "tokens":
        stmt = stmt.order_by(desc("total_tokens"))
    elif sort_by == "blocked":
        stmt = stmt.order_by(desc("blocked_requests"))
    elif sort_by == "latency":
        stmt = stmt.order_by(desc("avg_latency"))
    elif sort_by == "last_used":
        stmt = stmt.order_by(desc("last_used"))
    else:
        stmt = stmt.order_by(desc("total_requests"))
        
    stmt = stmt.limit(limit)
    
    results = (await db.execute(stmt)).all()
    
    # Cast integers carefully since SQLAlchemy sums over bools might need handling
    # Depending on DB dialect (Neon PostgreSQL), sum over bools can be tricky.
    return [
        {
            "user_id": str(r.id),
            "email": r.email,
            "plan": r.ai_plan,
            "is_admin": r.is_admin,
            "effective_plan": "admin" if r.is_admin else r.ai_plan,
            "total_requests": r.total_requests or 0,
            "successful_requests": r.success_requests or 0,
            "blocked_requests": r.blocked_requests or 0,
            "failed_requests": r.failed_requests or 0,
            "total_reported_tokens": r.total_tokens,
            "estimated_cost": r.estimated_cost,
            "last_used": r.last_used.isoformat() if r.last_used else None,
            "avg_latency": r.avg_latency
        }
        for r in results
    ]

@router.get("/plans")
async def get_plans_analytics(
    db: AsyncSession = Depends(get_db),
    current_admin: User = Depends(get_admin_user)
):
    stmt = select(
        User.ai_plan,
        User.is_admin,
        func.count(func.distinct(User.id)).label("total_users"),
        func.count(AIUsageEvent.id).label("total_requests"),
        func.sum(func.cast(AIUsageEvent.status == "quota_blocked", func.cast(func.integer, func.integer))).label("blocked_count")
    ).join(AIUsageEvent, User.id == AIUsageEvent.user_id, isouter=True) \
     .group_by(User.ai_plan, User.is_admin)

    results = (await db.execute(stmt)).all()
    
    # Aggregate by effective plan
    plan_aggregates = {}
    
    for r in results:
        effective_plan = "admin" if r.is_admin else r.ai_plan
        
        if effective_plan not in plan_aggregates:
            plan_aggregates[effective_plan] = {
                "plan_name": effective_plan,
                "total_users": 0,
                "total_requests": 0,
                "quota_blocked_count": 0,
            }
            
        plan_aggregates[effective_plan]["total_users"] += r.total_users or 0
        plan_aggregates[effective_plan]["total_requests"] += r.total_requests or 0
        plan_aggregates[effective_plan]["quota_blocked_count"] += r.blocked_count or 0
        
    for plan_meta in plan_aggregates.values():
        total_req = plan_meta["total_requests"]
        total_usr = plan_meta["total_users"]
        plan_meta["average_requests_per_user"] = (total_req / total_usr) if total_usr > 0 else 0
        
    return list(plan_aggregates.values())

@router.get("/features")
async def get_features(
    db: AsyncSession = Depends(get_db),
    current_admin: User = Depends(get_admin_user)
):
    stmt = select(
        AIUsageEvent.feature_name,
        func.count(AIUsageEvent.id).label("total_requests"),
        func.sum(func.cast(AIUsageEvent.status.in_(["success", "fallback_success"]), func.cast(func.integer, func.integer))).label("success_count"),
        func.sum(func.cast(AIUsageEvent.status.in_(["failed", "fallback_failed"]), func.cast(func.integer, func.integer))).label("failed_count"),
        func.sum(func.cast(AIUsageEvent.status == "quota_blocked", func.cast(func.integer, func.integer))).label("blocked_count"),
        func.avg(AIUsageEvent.latency_ms).label("avg_latency"),
        func.sum(AIUsageEvent.total_tokens).label("total_tokens")
    ).group_by(AIUsageEvent.feature_name).order_by(desc("total_requests"))
    
    results = (await db.execute(stmt)).all()
    
    features = []
    for r in results:
        tot = r.total_requests or 0
        suc = r.success_count or 0
        fai = r.failed_count or 0
        
        # breakdown by provider for this feature
        prov_stmt = select(AIUsageEvent.provider, func.count(AIUsageEvent.id)).where(AIUsageEvent.feature_name == r.feature_name).group_by(AIUsageEvent.provider)
        prov_res = (await db.execute(prov_stmt)).all()
        providers = {pr: c for pr, c in prov_res}
        
        features.append({
            "feature_name": r.feature_name,
            "total_requests": tot,
            "success_count": suc,
            "failure_count": fai,
            "quota_blocked_count": r.blocked_count or 0,
            "success_rate": (suc / tot * 100) if tot > 0 else 0,
            "failure_rate": (fai / tot * 100) if tot > 0 else 0,
            "average_latency_ms": r.avg_latency,
            "total_reported_tokens": r.total_tokens,
            "provider_breakdown": providers
        })
    return features

@router.get("/events")
async def get_events(
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=1, le=100),
    user_id: Optional[UUID] = None,
    provider: Optional[str] = None,
    feature_name: Optional[str] = None,
    status: Optional[str] = None,
    date_from: Optional[datetime] = None,
    date_to: Optional[datetime] = None,
    db: AsyncSession = Depends(get_db),
    current_admin: User = Depends(get_admin_user)
):
    filters = []
    if user_id:
        filters.append(AIUsageEvent.user_id == user_id)
    if provider:
        filters.append(AIUsageEvent.provider == provider)
    if feature_name:
        filters.append(AIUsageEvent.feature_name == feature_name)
    if status:
        filters.append(AIUsageEvent.status == status)
    if date_from:
        filters.append(AIUsageEvent.created_at >= date_from)
    if date_to:
        filters.append(AIUsageEvent.created_at <= date_to)
        
    count_stmt = select(func.count(AIUsageEvent.id))
    if filters:
        count_stmt = count_stmt.where(and_(*filters))
    total_count = (await db.execute(count_stmt)).scalar() or 0
    
    stmt = select(AIUsageEvent, User.email) \
        .join(User, User.id == AIUsageEvent.user_id) \
        .order_by(desc(AIUsageEvent.created_at))
        
    if filters:
        stmt = stmt.where(and_(*filters))
        
    stmt = stmt.offset((page - 1) * limit).limit(limit)
    
    results = (await db.execute(stmt)).all()
    
    events = []
    for evt, email in results:
        events.append({
            "id": str(evt.id),
            "user_id": str(evt.user_id),
            "user_email": email,
            "provider": evt.provider,
            "feature_name": evt.feature_name,
            "status": evt.status,
            "input_tokens": evt.input_tokens,
            "output_tokens": evt.output_tokens,
            "total_tokens": evt.total_tokens,
            "estimated_cost": evt.estimated_cost,
            "latency_ms": evt.latency_ms,
            "created_at": evt.created_at.isoformat()
        })
        
    return {
        "items": events,
        "total": total_count,
        "page": page,
        "limit": limit,
        "pages": (total_count + limit - 1) // limit
    }
