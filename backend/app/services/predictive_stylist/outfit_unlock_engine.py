from sqlalchemy.ext.asyncio import AsyncSession
import uuid
from typing import Dict, List

from app.services.shopping_intelligence.purchase_opportunity_engine import purchase_opportunity_engine

class OutfitUnlockEngine:
    """
    Quantifies the mathematical impact of adding a generic item type
    by querying the central Purchase Opportunity Engine.
    """

    async def get_outfit_unlocks(self, session: AsyncSession, user_id: uuid.UUID) -> List[Dict]:
        opportunities = await purchase_opportunity_engine.get_opportunities(session, user_id)
        
        unlocks = []
        for opp in opportunities:
            if opp.get("opportunity_type") == "high_outfit_unlock":
                unlocks.append({
                    "insight": f"Adding {opp.get('category', 'an item')} unlocks up to {opp.get('outfits_unlocked', 0)} combinations.",
                    "why_it_matters": opp.get("reasoning", "Multiplies your wardrobe combinations."),
                    "recommended_action": opp.get("expected_impact", "Consider this category."),
                    "priority_score": opp.get("priority_score", 50)
                })
                
        return unlocks

outfit_unlock_engine = OutfitUnlockEngine()
