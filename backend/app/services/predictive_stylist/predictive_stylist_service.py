from sqlalchemy.ext.asyncio import AsyncSession
import uuid
from typing import Dict, Any

from app.services.predictive_stylist.wardrobe_opportunity_engine import wardrobe_opportunity_engine
from app.services.predictive_stylist.utilization_predictor import utilization_predictor
from app.services.predictive_stylist.wardrobe_gap_analyzer import wardrobe_gap_analyzer
from app.services.predictive_stylist.outfit_unlock_engine import outfit_unlock_engine
from app.services.predictive_stylist.predictive_insight_priority_engine import predictive_insight_priority_engine

from app.models.clothing_item import ClothingItem
from sqlalchemy import select, func

class PredictiveStylistService:
    
    async def get_insights(self, session: AsyncSession, user_id: uuid.UUID) -> Dict[str, Any]:
        opportunities = await wardrobe_opportunity_engine.get_underutilized_value(session, user_id)
        gaps = await wardrobe_gap_analyzer.identify_gaps(session, user_id)
        rotation_risks = await utilization_predictor.get_rotation_risks(session, user_id)
        unlocks = await outfit_unlock_engine.get_outfit_unlocks(session, user_id)
        
        prioritized = predictive_insight_priority_engine.format_and_prioritize(
            underutilized=opportunities,
            neglected=[],
            gaps=gaps,
            rotation_risks=rotation_risks,
            unlocks=unlocks
        )
        
        return prioritized

    async def get_opportunities(self, session: AsyncSession, user_id: uuid.UUID) -> Dict[str, Any]:
        gaps = await wardrobe_gap_analyzer.identify_gaps(session, user_id)
        unlocks = await outfit_unlock_engine.get_outfit_unlocks(session, user_id)
        return {
            "gaps": gaps,
            "unlocks": unlocks
        }

    async def get_forecast(self, session: AsyncSession, user_id: uuid.UUID) -> Dict[str, Any]:
        risks = await utilization_predictor.get_rotation_risks(session, user_id)
        
        # Build category distribution map for the frontend utilization heatmap
        query = select(ClothingItem.category, func.avg(ClothingItem.worn_count)).where(
            ClothingItem.user_id == user_id
        ).group_by(ClothingItem.category)
        
        result = await session.execute(query)
        heatmap_data = [{"category": row[0], "avg_worn": float(row[1])} for row in result.all()]
        
        return {
            "forecast_risks": risks,
            "heatmap_data": heatmap_data
        }

predictive_stylist_service = PredictiveStylistService()
