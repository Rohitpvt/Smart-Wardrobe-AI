from sqlalchemy.ext.asyncio import AsyncSession
import uuid
from typing import Dict, Any

from app.services.intelligence import intelligence_service

class SeasonalPurchaseEngine:
    """
    Calculates seasonal gap scores.
    """
    
    async def get_seasonal_readiness_improvement(self, session: AsyncSession, user_id: uuid.UUID, potential_item: Dict[str, Any]) -> int:
        readiness = await intelligence_service.get_seasonal_readiness(session, user_id)
        
        # Simplified deterministic logic for item impact on seasonal readiness
        item_season = potential_item.get("season", "all").lower()
        current_season = readiness.get("current_season", "summer").lower()
        
        if item_season == "all":
            return 100
        
        if item_season == current_season:
            # If the current season readiness is low, buying an item for it gives high ROI
            current_score = readiness.get("readiness_score", 50)
            return min(100, (100 - current_score) + 20)
            
        return 20 # Low improvement for off-season items

seasonal_purchase_engine = SeasonalPurchaseEngine()
