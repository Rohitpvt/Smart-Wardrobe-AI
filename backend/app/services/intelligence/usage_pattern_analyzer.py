import uuid
from typing import Dict, Any, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc

from app.models.clothing_item import ClothingItem

class UsagePatternAnalyzer:
    """
    Analyzes worn_count and last_worn_at to determine 
    top worn items, neglected items, and rotation quality.
    """
    
    async def analyze(self, session: AsyncSession, user_id: uuid.UUID) -> Dict[str, Any]:
        query = select(ClothingItem).where(ClothingItem.user_id == user_id)
        result = await session.execute(query)
        items = result.scalars().all()

        if not items:
            return self._empty_state()

        # Sort items by worn_count descending
        sorted_by_wear = sorted(items, key=lambda x: x.worn_count, reverse=True)
        
        top_worn = sorted_by_wear[:5]
        # Least worn are items with 0 wear or lowest wear, sorted by id or date to be deterministic
        least_worn = sorted([i for i in items if i.worn_count == 0], key=lambda x: x.created_at)
        if not least_worn:
            least_worn = sorted_by_wear[-5:]
        else:
            least_worn = least_worn[:5]

        # Calculate neglected value (mock logic: $50 avg per item if purchase_price is missing)
        neglected_value = sum((i.purchase_price or 50.0) for i in items if i.worn_count == 0)

        # Rotation quality: percentage of items worn at least once
        worn_items = len([i for i in items if i.worn_count > 0])
        rotation_quality = int((worn_items / len(items)) * 100) if items else 0

        def map_item(item: ClothingItem) -> Dict[str, Any]:
            return {
                "id": str(item.id),
                "name": item.name,
                "image_url": item.image_url,
                "worn_count": item.worn_count,
                "last_worn_at": item.last_worn_at.isoformat() if item.last_worn_at else None
            }

        return {
            "top_worn": [map_item(i) for i in top_worn],
            "least_worn": [map_item(i) for i in least_worn],
            "neglected_value": round(neglected_value, 2),
            "rotation_quality": rotation_quality
        }

    def _empty_state(self) -> Dict[str, Any]:
        return {
            "top_worn": [],
            "least_worn": [],
            "neglected_value": 0.0,
            "rotation_quality": 0
        }

usage_pattern_analyzer = UsagePatternAnalyzer()
