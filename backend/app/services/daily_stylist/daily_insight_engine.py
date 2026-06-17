import uuid
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Dict, Any

from app.services.intelligence import intelligence_service
from app.services.style_memory.style_memory_service import style_memory_service

class DailyInsightEngine:
    """
    Generates a single deterministic daily insight based on a prioritized hierarchy:
    1. Neglected Item Insight
    2. Wardrobe Health Insight
    3. Style Memory Insight
    4. Fashion Evolution Insight
    """

    async def generate_daily_insight(self, session: AsyncSession, user_id: uuid.UUID) -> str:
        # Priority 1: Neglected Item
        usage = await intelligence_service.get_usage_intelligence(session, user_id)
        least_worn = usage.get("least_worn", [])
        if least_worn:
            item = least_worn[0]
            days_unworn = item.get("days_since_last_worn", 0)
            if days_unworn > 14:
                return f"You haven't worn your {item.get('name', 'item')} in {days_unworn} days."

        # Priority 2: Wardrobe Health
        health = await intelligence_service.get_wardrobe_health(session, user_id)
        if health.get("rotation_health", 0) > 80:
            return "Your wardrobe rotation is excellent! You are utilizing your pieces well."
        
        seasonal = await intelligence_service.get_seasonal_readiness(session, user_id)
        if seasonal.get("readiness_score", 0) > 80:
            season = seasonal.get("season", "current season")
            return f"Your wardrobe is fully ready and optimized for {season} weather."

        # Priority 3: Style Memory
        memory = await style_memory_service.get_style_memory_profile(session, user_id)
        insights = memory.get("recently_learned_insights", [])
        if insights:
            # Clean up the insight slightly for daily brief format
            return f"Style Insight: {insights[0]}"

        # Priority 4: Fashion Evolution (Fallback)
        preferred = memory.get("preferred_style", "casual")
        return f"Your wardrobe currently leans towards a {preferred} aesthetic."

daily_insight_engine = DailyInsightEngine()
