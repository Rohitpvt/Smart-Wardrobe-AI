from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
import uuid
from typing import List, Optional, Dict, Any
from datetime import datetime, timezone

from app.models.wear_event import WearEvent, WearSourceType
from app.models.clothing_item import ClothingItem

class WearTrackingService:
    
    async def log_wear_event(
        self, 
        session: AsyncSession, 
        user_id: uuid.UUID, 
        clothing_item_ids: List[uuid.UUID],
        worn_at: datetime,
        source_type: WearSourceType = WearSourceType.MANUAL,
        occasion: Optional[str] = None,
        notes: Optional[str] = None,
        season: Optional[str] = None,
        weather_snapshot: Optional[Dict[str, Any]] = None
    ) -> uuid.UUID:
        
        wear_group_id = uuid.uuid4()
        
        # Create wear events
        for item_id in clothing_item_ids:
            event = WearEvent(
                user_id=user_id,
                wear_group_id=wear_group_id,
                clothing_item_id=item_id,
                worn_at=worn_at,
                source_type=source_type,
                occasion=occasion,
                notes=notes,
                season=season,
                weather_snapshot=weather_snapshot
            )
            session.add(event)
            
            # Update ClothingItem aggregates natively
            # This satisfies the requirement to update worn_count and last_worn_at
            stmt = update(ClothingItem).where(
                ClothingItem.id == item_id,
                ClothingItem.user_id == user_id
            ).values(
                worn_count=ClothingItem.worn_count + 1,
                last_worn_at=worn_at
            )
            await session.execute(stmt)
            
        await session.commit()
        return wear_group_id

wear_tracking_service = WearTrackingService()
