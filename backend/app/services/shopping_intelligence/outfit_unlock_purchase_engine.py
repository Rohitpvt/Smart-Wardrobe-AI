from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
import uuid
from typing import Dict, Any

from app.models.clothing_item import ClothingItem

class OutfitUnlockPurchaseEngine:
    """
    Calculates +X outfits using deterministic outfit combinatorics.
    """
    
    async def get_outfit_unlocks(self, session: AsyncSession, user_id: uuid.UUID, potential_item: Dict[str, Any]) -> int:
        query = select(ClothingItem.category, func.count(ClothingItem.id)).where(
            ClothingItem.user_id == user_id
        ).group_by(ClothingItem.category)
        
        result = await session.execute(query)
        counts = {row[0].lower(): row[1] for row in result.all()}
        
        tops = counts.get("tops", 0)
        bottoms = counts.get("bottoms", 0)
        shoes = counts.get("footwear", 0)
        outerwear = counts.get("outerwear", 0)
        
        category = potential_item.get("category", "").lower()
        
        # Calculate how many combinations are added by adding 1 item to this category
        if category == "tops":
            return max(1, bottoms) * max(1, shoes) * max(1, outerwear)
        elif category == "bottoms":
            return max(1, tops) * max(1, shoes) * max(1, outerwear)
        elif category == "footwear":
            return max(1, tops) * max(1, bottoms) * max(1, outerwear)
        elif category == "outerwear":
            return max(1, tops) * max(1, bottoms) * max(1, shoes)
            
        return 0

outfit_unlock_purchase_engine = OutfitUnlockPurchaseEngine()
