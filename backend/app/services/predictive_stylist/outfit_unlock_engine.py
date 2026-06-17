from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
import uuid
from typing import Dict, List

from app.models.clothing_item import ClothingItem

class OutfitUnlockEngine:
    """
    Quantifies the mathematical impact of adding a generic item type
    to expand outfit combinations.
    """

    async def get_outfit_unlocks(self, session: AsyncSession, user_id: uuid.UUID) -> List[Dict]:
        query = select(ClothingItem.category, func.count(ClothingItem.id)).where(
            ClothingItem.user_id == user_id
        ).group_by(ClothingItem.category)
        
        result = await session.execute(query)
        counts = {row[0].lower(): row[1] for row in result.all()}
        
        tops = counts.get("tops", 0)
        bottoms = counts.get("bottoms", 0)
        shoes = counts.get("footwear", 0)
        outerwear = counts.get("outerwear", 0)
        
        unlocks = []
        
        # If adding 1 outerwear item
        if outerwear < 2 and tops > 0 and bottoms > 0:
            potential = tops * bottoms * max(1, shoes)
            unlocks.append({
                "insight": f"Adding a versatile jacket would unlock up to {potential} new layered outfit combinations.",
                "why_it_matters": "Layering multiplies existing wardrobe value exponentially without needing many new items.",
                "recommended_action": "Look for a neutral overshirt or casual blazer.",
                "priority_score": min(95, potential * 2)
            })
            
        # If adding 1 pair of shoes
        if shoes < 3 and tops > 0 and bottoms > 0:
            potential = tops * bottoms * max(1, outerwear + 1)
            unlocks.append({
                "insight": f"One new pair of neutral sneakers could improve versatility across {potential} outfits.",
                "why_it_matters": "Footwear acts as the anchor for outfit formality. A versatile shoe unlocks entirely new aesthetic contexts.",
                "recommended_action": "Consider a minimalist white or grey leather sneaker.",
                "priority_score": min(90, potential * 1.5)
            })

        unlocks.sort(key=lambda x: x["priority_score"], reverse=True)
        return unlocks

outfit_unlock_engine = OutfitUnlockEngine()
