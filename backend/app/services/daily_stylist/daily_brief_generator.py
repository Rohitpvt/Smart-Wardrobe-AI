import uuid
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession

from app.services.recommendations.recommendation_service import recommendation_service
from app.services.style_memory.style_memory_service import style_memory_service
from app.services.intelligence import intelligence_service
from app.services.weather.provider import weather_service
from app.models.user import User

class DailyBriefGenerator:
    """
    Generates the core daily outfit by determining the correct occasion hierarchy.
    Occasion Hierarchy:
    1. Style Memory Preference
    2. Most Frequently Worn
    3. Day of Week Heuristic
    4. CASUAL
    """

    async def determine_occasion(self, session: AsyncSession, user_id: uuid.UUID) -> str:
        # Priority 1: Style Memory Preference
        memory = await style_memory_service.get_style_memory_profile(session, user_id)
        pref_style = memory.get("preferred_style", "neutral").upper()
        if pref_style in ["FORMAL", "SMART_CASUAL", "CASUAL", "OFFICE", "PARTY"]:
            return pref_style

        # Priority 2: Most Frequently Worn
        usage = await intelligence_service.get_usage_intelligence(session, user_id)
        most_worn = usage.get("most_worn", [])
        if most_worn:
            top_item = most_worn[0]
            if top_item.get("category"):
                cat = top_item.get("category").upper()
                if "SUIT" in cat or "BLAZER" in cat:
                    return "FORMAL"

        # Priority 3: Day of Week Heuristic
        day_of_week = datetime.now().weekday() # 0 = Monday, 6 = Sunday
        if day_of_week < 5: # Mon-Fri
            return "SMART_CASUAL"
        else: # Sat-Sun
            return "CASUAL"

        # Priority 4: Fallback
        return "CASUAL"

    async def generate_outfit(self, session: AsyncSession, current_user: User):
        occasion = await self.determine_occasion(session, current_user.id)
        
        weather_ctx = await weather_service.get_current_weather(
            current_user.city, current_user.country_code
        )

        recommendations = await recommendation_service.generate_explainable_recommendations(
            session=session,
            user_id=current_user.id,
            occasion=occasion,
            weather=weather_ctx,
            generation_mode="standard"
        )
        
        return recommendations[0], weather_ctx

daily_brief_generator = DailyBriefGenerator()
