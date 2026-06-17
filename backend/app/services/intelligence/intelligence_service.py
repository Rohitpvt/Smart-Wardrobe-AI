import uuid
from typing import Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession

from .style_dna_engine import style_dna_engine
from .wardrobe_health_analyzer import wardrobe_health_analyzer
from .usage_pattern_analyzer import usage_pattern_analyzer
from .seasonal_readiness_analyzer import seasonal_readiness_analyzer
from .fashion_evolution_tracker import fashion_evolution_tracker
from .outfit_success_predictor import outfit_success_predictor

class IntelligenceService:
    """
    Unified Intelligence Facade.
    Acts as the single orchestration layer for all Phase 9A intelligence modules.
    Provides a clean integration point for caching and future AI-powered generation.
    """

    async def get_style_dna(self, session: AsyncSession, user_id: uuid.UUID) -> Dict[str, Any]:
        return await style_dna_engine.analyze(session, user_id)

    async def get_wardrobe_health(self, session: AsyncSession, user_id: uuid.UUID) -> Dict[str, Any]:
        return await wardrobe_health_analyzer.analyze(session, user_id)

    async def get_usage_intelligence(self, session: AsyncSession, user_id: uuid.UUID) -> Dict[str, Any]:
        return await usage_pattern_analyzer.analyze(session, user_id)

    async def get_seasonal_readiness(self, session: AsyncSession, user_id: uuid.UUID) -> Dict[str, Any]:
        return await seasonal_readiness_analyzer.analyze(session, user_id)

    async def get_fashion_evolution(self, session: AsyncSession, user_id: uuid.UUID) -> Dict[str, Any]:
        return await fashion_evolution_tracker.analyze(session, user_id)

    async def predict_outfit_success(self, session: AsyncSession, user_id: uuid.UUID) -> Dict[str, Any]:
        return await outfit_success_predictor.analyze(session, user_id)

intelligence_service = IntelligenceService()
