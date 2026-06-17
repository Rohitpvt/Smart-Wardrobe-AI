from sqlalchemy.ext.asyncio import AsyncSession
import uuid
from typing import List, Dict

from app.services.intelligence import intelligence_service

class WardrobeOpportunityEngine:
    """
    Identifies underutilized items that have high potential but low actual usage.
    """
    
    async def get_underutilized_value(self, session: AsyncSession, user_id: uuid.UUID) -> List[Dict]:
        # Using Phase 9A intelligence usage patterns as base
        usage = await intelligence_service.get_usage_intelligence(session, user_id)
        least_worn = usage.get("least_worn", [])
        
        opportunities = []
        for item in least_worn:
            days_unworn = item.get("days_since_last_worn", 0)
            if days_unworn > 21:
                opportunities.append({
                    "item_id": item.get("id"),
                    "item_name": item.get("name"),
                    "image_url": item.get("image_url"),
                    "category": item.get("category"),
                    "insight": f"Your {item.get('name', 'item')} has significant underutilized value.",
                    "why_it_matters": f"It hasn't been worn in {days_unworn} days, representing locked wardrobe value.",
                    "recommended_action": "Try building an outfit around it as an anchor item today.",
                    "priority_score": min(100, days_unworn)
                })
        
        # Sort by priority score descending
        opportunities.sort(key=lambda x: x["priority_score"], reverse=True)
        return opportunities

wardrobe_opportunity_engine = WardrobeOpportunityEngine()
