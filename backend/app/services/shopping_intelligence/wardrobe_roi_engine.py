from sqlalchemy.ext.asyncio import AsyncSession
import uuid
from typing import Dict, Any

from app.services.shopping_intelligence.style_compatibility_engine import style_compatibility_engine
from app.services.shopping_intelligence.seasonal_purchase_engine import seasonal_purchase_engine
from app.services.shopping_intelligence.outfit_unlock_purchase_engine import outfit_unlock_purchase_engine
from app.services.intelligence import intelligence_service

class WardrobeROIEngine:
    """
    Calculates Wardrobe ROI using:
    - 40% Outfit Unlock Impact
    - 25% Wardrobe Health Improvement
    - 20% Style Compatibility
    - 15% Seasonal Readiness
    """
    
    async def calculate_roi(self, session: AsyncSession, user_id: uuid.UUID, potential_item: Dict[str, Any]) -> Dict[str, Any]:
        # 1. Outfit Unlock (0-100 normalized where 20+ outfits unlocked = 100)
        unlocks = await outfit_unlock_purchase_engine.get_outfit_unlocks(session, user_id, potential_item)
        unlock_score = min(100, (unlocks / 20) * 100) if unlocks > 0 else 0
        
        # 2. Wardrobe Health Improvement
        # A simpler deterministic proxy: if their current utilization is low, generic staples improve health highly.
        health = await intelligence_service.get_wardrobe_health(session, user_id)
        current_health = health.get("health_score", 50)
        # Assuming any recommended item here is a staple/good purchase
        health_improvement = min(100, (100 - current_health) + 20)
        
        # 3. Style Compatibility
        style_score = await style_compatibility_engine.get_compatibility(session, user_id, potential_item)
        
        # 4. Seasonal Readiness
        seasonal_score = await seasonal_purchase_engine.get_seasonal_readiness_improvement(session, user_id, potential_item)
        
        # Weighted Final Score
        final_roi = (
            (unlock_score * 0.40) +
            (health_improvement * 0.25) +
            (style_score * 0.20) +
            (seasonal_score * 0.15)
        )
        
        return {
            "roi_score": round(final_roi),
            "outfits_unlocked": unlocks,
            "breakdown": {
                "outfit_unlock_score": round(unlock_score),
                "wardrobe_health_improvement": round(health_improvement),
                "style_compatibility": round(style_score),
                "seasonal_readiness": round(seasonal_score)
            }
        }

wardrobe_roi_engine = WardrobeROIEngine()
