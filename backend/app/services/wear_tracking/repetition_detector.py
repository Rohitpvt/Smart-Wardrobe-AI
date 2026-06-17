from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
import uuid
from typing import List, Dict, Any
from datetime import datetime, timedelta, timezone

from app.models.wear_event import WearEvent
from app.models.clothing_item import ClothingItem

class RepetitionDetector:
    """
    Detects overuse of items.
    """
    
    async def get_repetition_insights(self, session: AsyncSession, user_id: uuid.UUID) -> List[Dict[str, Any]]:
        # Look back 14 days
        two_weeks_ago = datetime.now(timezone.utc) - timedelta(days=14)
        
        query = select(WearEvent.clothing_item_id, ClothingItem.name, ClothingItem.category, ClothingItem.image_url)\
            .join(ClothingItem, WearEvent.clothing_item_id == ClothingItem.id)\
            .where(
                WearEvent.user_id == user_id,
                WearEvent.worn_at >= two_weeks_ago
            )
            
        result = await session.execute(query)
        events = result.all()
        
        counts = {}
        for item_id, name, category, image_url in events:
            iid = str(item_id)
            if iid not in counts:
                counts[iid] = {
                    "item_id": iid,
                    "name": name,
                    "category": category,
                    "image_url": image_url,
                    "recent_wears": 0
                }
            counts[iid]["recent_wears"] += 1
            
        warnings = []
        for v in counts.values():
            if v["recent_wears"] >= 4:
                warnings.append({
                    "item_name": v["name"],
                    "image_url": v["image_url"],
                    "warning": f"You've worn this {v['category']} {v['recent_wears']} times in the last 14 days.",
                    "type": "overuse"
                })
                
        return warnings

repetition_detector = RepetitionDetector()
