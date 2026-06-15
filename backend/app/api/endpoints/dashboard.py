from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

from app.api.dependencies import get_current_user
from app.core.database import get_db
from app.models.user import User
from app.services import dashboard as dashboard_service
from app.schemas.dashboard import (
    DashboardSummaryResponse,
    ConfidenceTrendItem,
    DashboardIntelligenceResponse,
    WearAnalyticsResponse,
    PurchaseRecommendationsResponse,
    PredictiveInsightsResponse,
)

router = APIRouter()

@router.get("", response_model=DashboardSummaryResponse)
async def get_dashboard(
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db)
):
    """
    Retrieve consolidated dashboard summary metrics.
    Includes health metrics, distributions, and recent items.
    """
    return await dashboard_service.get_dashboard_summary(session, current_user.id)

@router.get("/confidence-trend", response_model=List[ConfidenceTrendItem])
async def get_confidence_trend(
    days: int = 30,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db)
):
    """
    Retrieve average AI confidence grouped by upload date.
    """
    return await dashboard_service.get_confidence_trend(session, current_user.id, days)

@router.get("/intelligence", response_model=DashboardIntelligenceResponse)
async def get_dashboard_intelligence_endpoint(
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db)
):
    """
    Retrieve Phase 6A advanced AI intelligence metrics including Cost-Per-Wear
    and Wardrobe Gap Analysis.
    """
    return await dashboard_service.get_dashboard_intelligence(session, current_user.id)

@router.get("/analytics", response_model=WearAnalyticsResponse)
async def get_wear_analytics(
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db)
):
    """
    Retrieve Phase 6B wear pattern analytics including
    most/least worn items, favorite colors, and usage trends.
    """
    return await dashboard_service.get_wear_analytics(session, current_user.id)

@router.get("/recommendations/purchases", response_model=PurchaseRecommendationsResponse)
async def get_purchase_recommendations(
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db)
):
    """
    Retrieve Phase 6B smart purchase recommendations
    based on wardrobe gaps and wear patterns.
    """
    return await dashboard_service.get_purchase_recommendations(session, current_user.id)

@router.get("/predictive", response_model=PredictiveInsightsResponse)
async def get_predictive_insights(
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db)
):
    """
    Retrieve Phase 6B predictive intelligence:
    rotation analysis, style DNA profile, and forecasted CPW.
    """
    return await dashboard_service.get_predictive_insights(session, current_user.id)

@router.get("/taste-profile")
async def get_taste_profile(
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db)
):
    """
    Retrieve Phase 7A Taste Profile including Style Evolution.
    """
    from app.services.taste_profile_service import taste_profile_service
    return await taste_profile_service.generate_profile(session, current_user.id)
