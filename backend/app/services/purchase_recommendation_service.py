import uuid
from typing import List, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.models.clothing_item import ClothingItem

class PurchaseRecommendationService:
    async def recommend(self, session: AsyncSession, user_id: uuid.UUID) -> List[Dict[str, Any]]:
        # Check current wardrobe
        stmt = select(ClothingItem).where(ClothingItem.user_id == user_id)
        result = await session.execute(stmt)
        items = result.scalars().all()
        
        categories = {item.category for item in items}
        
        # Simple gap analysis for demonstration of service recovery
        recommendations = []
        
        if "Outerwear" not in categories:
            recommendations.append({
                "id": "rec-1",
                "item_type": "Versatile Outerwear",
                "reason": "You have no outerwear. A neutral jacket would instantly unlock 4+ new outfits with your existing tops.",
                "expected_outfit_gain": 4,
                "confidence_score": 92.5,
                "priority": "High"
            })
            
        if "Footwear" not in categories:
            recommendations.append({
                "id": "rec-2",
                "item_type": "Everyday Sneakers",
                "reason": "Missing casual footwear limits your bottom/top pairings.",
                "expected_outfit_gain": 5,
                "confidence_score": 88.0,
                "priority": "High"
            })

        if not recommendations and len(items) > 0:
            recommendations.append({
                "id": "rec-3",
                "item_type": "Statement Accessory",
                "reason": "Your wardrobe essentials are well-covered. Consider a statement accessory to elevate your standard rotations.",
                "expected_outfit_gain": 2,
                "confidence_score": 75.0,
                "priority": "Medium"
            })
            
        return recommendations

purchase_recommendation_service = PurchaseRecommendationService()
