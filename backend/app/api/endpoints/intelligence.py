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
