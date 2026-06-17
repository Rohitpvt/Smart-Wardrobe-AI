from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
import uuid
from typing import Dict, List

from app.models.clothing_item import ClothingItem

class WardrobeGapAnalyzer:
    """
    Evaluates category coverage against standard wardrobe distributions
    to identify missing essentials.
    """

    async def identify_gaps(self, session: AsyncSession, user_id: uuid.UUID) -> List[Dict]:
        query = select(ClothingItem.category, func.count(ClothingItem.id)).where(
            ClothingItem.user_id == user_id
        ).group_by(ClothingItem.category)
        
        result = await session.execute(query)
        counts = {row[0].lower(): row[1] for row in result.all()}
        
        gaps = []
        
        # Expected minimums for a healthy wardrobe
        if counts.get("outerwear", 0) < 1:
            gaps.append({
                "insight": "You are missing a versatile outer layer.",
                "why_it_matters": "Outerwear is essential for weather adaptability and layering in smart-casual outfits.",
                "recommended_action": "Consider adding a lightweight jacket or overshirt.",
                "priority_score": 80
            })
            
        if counts.get("footwear", 0) < 2:
            gaps.append({
                "insight": "Your footwear options are extremely limited.",
                "why_it_matters": "Rotating footwear extends the life of your shoes and significantly alters outfit aesthetics.",
                "recommended_action": "Add at least one neutral sneaker and one formal shoe.",
                "priority_score": 85
            })

        if counts.get("bottoms", 0) < 3:
            gaps.append({
                "insight": "Your bottom wear rotation is below average.",
                "why_it_matters": "A solid foundation of bottoms is critical for creating diverse outfits without over-repetition.",
                "recommended_action": "Add versatile bottoms like dark denim or neutral chinos.",
                "priority_score": 70
            })

        gaps.sort(key=lambda x: x["priority_score"], reverse=True)
        return gaps

wardrobe_gap_analyzer = WardrobeGapAnalyzer()
