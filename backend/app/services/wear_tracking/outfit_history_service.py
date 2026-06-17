from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from sqlalchemy.orm import selectinload
import uuid
from typing import List, Dict, Any
from datetime import datetime, timezone, timedelta

from app.models.wear_event import WearEvent
from app.schemas.analytics import AnalyticsWindow

class OutfitHistoryService:
    
    async def get_history(self, session: AsyncSession, user_id: uuid.UUID, page: int = 1, limit: int = 20, window: AnalyticsWindow = AnalyticsWindow.DAYS_30) -> List[Dict[str, Any]]:
        # Calculate cutoff based on window
        query = select(WearEvent).where(
            WearEvent.user_id == user_id
        )
        
        if window != AnalyticsWindow.ALL:
            days = 30
            if window == AnalyticsWindow.DAYS_90: days = 90
            elif window == AnalyticsWindow.DAYS_365: days = 365
                
            cutoff = datetime.now(timezone.utc) - timedelta(days=days)
            query = query.where(WearEvent.worn_at >= cutoff)
            
        # Group wear events by wear_group_id to reconstruct outfits
        query = query.order_by(desc(WearEvent.worn_at)).options(
            selectinload(WearEvent.clothing_item)
        )
        
        result = await session.execute(query)
        events = result.scalars().all()
        
        # Group by group_id preserving order
        groups = {}
        ordered_group_ids = []
        for e in events:
            gid = str(e.wear_group_id)
            if gid not in groups:
                groups[gid] = {
                    "wear_group_id": gid,
                    "worn_at": e.worn_at.isoformat(),
                    "source_type": e.source_type.value,
                    "occasion": e.occasion,
                    "season": e.season,
                    "items": []
                }
                ordered_group_ids.append(gid)
                
            groups[gid]["items"].append({
                "id": str(e.clothing_item.id),
                "name": e.clothing_item.name,
                "category": e.clothing_item.category,
                "image_url": e.clothing_item.image_url
            })
            
        # Apply pagination
        start_idx = (page - 1) * limit
        end_idx = start_idx + limit
        history = [groups[gid] for gid in ordered_group_ids[start_idx:end_idx]]
        
        return history

outfit_history_service = OutfitHistoryService()
