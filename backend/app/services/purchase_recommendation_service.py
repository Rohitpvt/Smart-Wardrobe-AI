import uuid
from typing import List, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.models.clothing_item import ClothingItem
from app.services.shopping_intelligence.purchase_opportunity_engine import purchase_opportunity_engine

class PurchaseRecommendationService:
    async def recommend(self, session: AsyncSession, user_id: uuid.UUID) -> List[Dict[str, Any]]:
        # Check current wardrobe
        stmt = select(ClothingItem).where(ClothingItem.user_id == user_id)
        result = await session.execute(stmt)
        items = result.scalars().all()
        
        categories = {item.category for item in items}
        
        # Consume deterministic Gap Analysis Engine
        opportunities = await purchase_opportunity_engine.get_opportunities(session, user_id)
        
        recommendations = []
        for idx, opp in enumerate(opportunities):
            recommendations.append({
                "id": f"rec-{idx+1}",
                "item_type": opp.get("item_name", "Wardrobe Gap"),
                "reason": opp.get("why_this_item", "Identified as a critical wardrobe gap."),
                "expected_outfit_gain": opp.get("outfits_unlocked", 0),
                "confidence_score": opp.get("confidence_score", 0),
                "priority": "High" if opp.get("priority_score", 0) >= 90 else "Medium"
            })
            
        return recommendations

purchase_recommendation_service = PurchaseRecommendationService()
