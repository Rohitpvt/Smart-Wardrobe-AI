from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, cast, Date
import uuid
from typing import Dict, Any, List
from datetime import datetime, timezone, timedelta

from app.models.wear_event import WearEvent
from app.schemas.analytics import AnalyticsWindow

class WearAnalyticsEngine:
    
    async def get_analytics(self, session: AsyncSession, user_id: uuid.UUID, window: AnalyticsWindow = AnalyticsWindow.DAYS_30) -> Dict[str, Any]:
        query = select(cast(WearEvent.worn_at, Date), func.count(WearEvent.wear_group_id.distinct())).where(
            WearEvent.user_id == user_id
        )
        
        if window != AnalyticsWindow.ALL:
            days = 30
            if window == AnalyticsWindow.DAYS_90: days = 90
            elif window == AnalyticsWindow.DAYS_365: days = 365
                
            cutoff = datetime.now(timezone.utc) - timedelta(days=days)
            query = query.where(WearEvent.worn_at >= cutoff)
            
        query = query.group_by(cast(WearEvent.worn_at, Date))
        
        result = await session.execute(query)
        heatmap_data = []
        for date_val, count in result.all():
            heatmap_data.append({
                "date": date_val.isoformat(),
                "count": count
            })
            
        return {
            "heatmap": heatmap_data,
            "total_wears_logged": sum(d["count"] for d in heatmap_data)
        }

wear_analytics_engine = WearAnalyticsEngine()
