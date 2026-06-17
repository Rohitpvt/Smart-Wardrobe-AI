from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies import get_current_user
from app.core.database import get_db
from app.models.user import User
from app.services.intelligence import intelligence_service
from app.schemas.intelligence import (
    StyleDNAResponse,
    WardrobeHealthResponse,
    UsageIntelligenceResponse,
    SeasonalReadinessResponse,
    FashionEvolutionResponse,
    OutfitSuccessPredictionResponse
)

router = APIRouter()

@router.get("/style-dna", response_model=StyleDNAResponse)
async def get_style_dna(
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db)
):
    """Generate a persistent style profile."""
    return await intelligence_service.get_style_dna(session, current_user.id)

@router.get("/wardrobe-health", response_model=WardrobeHealthResponse)
async def get_wardrobe_health(
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db)
):
    """Replace simplistic closet scoring with Health Score 2.0."""
    return await intelligence_service.get_wardrobe_health(session, current_user.id)

@router.get("/usage", response_model=UsageIntelligenceResponse)
async def get_usage_intelligence(
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db)
):
    """Identify overused items, neglected items, and rotation quality."""
    return await intelligence_service.get_usage_intelligence(session, current_user.id)

@router.get("/seasonal", response_model=SeasonalReadinessResponse)
async def get_seasonal_readiness(
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db)
):
    """Analyze readiness for current or upcoming seasons."""
    return await intelligence_service.get_seasonal_readiness(session, current_user.id)

@router.get("/evolution", response_model=FashionEvolutionResponse)
async def get_fashion_evolution(
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db)
):
    """Track historical style changes and wardrobe growth."""
    return await intelligence_service.get_fashion_evolution(session, current_user.id)

@router.get("/outfit-prediction", response_model=OutfitSuccessPredictionResponse)
async def predict_outfit_success(
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db)
):
    """Predict the success probability of outfits."""
    return await intelligence_service.predict_outfit_success(session, current_user.id)

from app.schemas.intelligence import IntelligenceCenterResponse, OpportunityStatusUpdate
from app.services.intelligence_feed_service import intelligence_feed_service
from app.models.intelligence import WardrobeOpportunity, WardrobeGoal, WeeklyReport
from sqlalchemy import select, update

@router.get("/center", response_model=IntelligenceCenterResponse)
async def get_intelligence_center(
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db)
):
    """Get all intelligence center elements (feed, opportunities, goals, weekly report) with guaranteed arrays."""
    # 1. Feed
    feed_items = await intelligence_feed_service.get_or_generate_feed(session, current_user.id)
    
    # 2. Opportunities
    stmt_opps = select(WardrobeOpportunity).where(
        WardrobeOpportunity.user_id == current_user.id,
        WardrobeOpportunity.status == "active"
    ).order_by(WardrobeOpportunity.impact_score.desc()).limit(3)
    opps_result = await session.execute(stmt_opps)
    opportunities = opps_result.scalars().all()
    
    # 3. Goals
    stmt_goals = select(WardrobeGoal).where(
        WardrobeGoal.user_id == current_user.id,
        WardrobeGoal.status == "active"
    ).order_by(WardrobeGoal.created_at.desc()).limit(3)
    goals_result = await session.execute(stmt_goals)
    goals = goals_result.scalars().all()
    
    # 4. Weekly Report
    stmt_report = select(WeeklyReport).where(
        WeeklyReport.user_id == current_user.id
    ).order_by(WeeklyReport.report_date.desc()).limit(1)
    report_result = await session.execute(stmt_report)
    report = report_result.scalar_one_or_none()
    
    return IntelligenceCenterResponse(
        feed=feed_items if feed_items else [],
        opportunities=opportunities if opportunities else [],
        goals=goals if goals else [],
        weekly_report=report
    )

@router.patch("/opportunities/{opportunity_id}/status")
async def update_opportunity_status(
    opportunity_id: str,
    update_data: OpportunityStatusUpdate,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db)
):
    """Update opportunity status (e.g. dismissed or completed)."""
    stmt = update(WardrobeOpportunity).where(
        WardrobeOpportunity.id == opportunity_id,
        WardrobeOpportunity.user_id == current_user.id
    ).values(status=update_data.status)
    await session.execute(stmt)
    await session.commit()
    return {"success": True, "id": opportunity_id, "status": update_data.status}
