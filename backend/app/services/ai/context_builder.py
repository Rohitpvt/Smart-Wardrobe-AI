"""
Context Builder Service.
Assembles the "StylistContext" for the Gemini Chat model based on the user's data.
"""

import uuid
from typing import Any, Dict
from sqlalchemy.ext.asyncio import AsyncSession

from app.services.taste_profile_service import taste_profile_service
from app.services.dashboard import (
    get_predictive_insights,
    get_dashboard_intelligence,
    get_purchase_recommendations
)
from app.services.weather.provider import weather_service


class ContextBuilderService:
    async def build_context(
        self, 
        session: AsyncSession, 
        user_id: uuid.UUID,
        include_weather: bool = False,
        city: str | None = None,
        country_code: str | None = None
    ) -> Dict[str, Any]:
        """
        Gathers all intelligence layers for the stylist prompt.
        """
        # 1. Taste Profile & Style DNA
        taste_profile = await taste_profile_service.generate_profile(session, user_id)
        
        # 2. Predictive Insights (Rotation)
        predictive = await get_predictive_insights(session, user_id)
        rotation = predictive.get("rotation", {})
        
        # 3. Wardrobe Health & Economics
        intelligence = await get_dashboard_intelligence(session, user_id)
        health = intelligence.get("health", {})
        
        # 4. Purchase Recommendations
        purchase_recs_data = await get_purchase_recommendations(session, user_id)
        purchase_recs = purchase_recs_data.get("recommendations", [])
        
        # 5. Weather Context (Optional)
        weather_ctx = None
        if include_weather and city and country_code:
            weather = await weather_service.get_current_weather(city, country_code)
            if weather.weather_used:
                weather_ctx = weather.model_dump()

        return {
            "taste_profile": {
                "profile_name": taste_profile.get("profile_name"),
                "favorite_colors": taste_profile.get("favorite_colors", []),
                "favorite_categories": taste_profile.get("favorite_categories", []),
                "formality_bias": taste_profile.get("preference_weights", {}).get("formality", {}),
            },
            "rotation_context": {
                "rotation_score": rotation.get("rotation_score", 0),
                "overused_items": [item.get("name") for item in rotation.get("overused", [])][:3],
                "recommended_rotation": [item.get("name") for item in rotation.get("recommended_rotation", [])][:3],
            },
            "wardrobe_health": {
                "gaps": health.get("gaps", []),
                "weaknesses": health.get("weaknesses", []),
            },
            "purchase_recommendations": [
                f"{r.get('priority')}: {r.get('category')} - {r.get('reason')}"
                for r in purchase_recs[:3]
            ],
            "weather": weather_ctx
        }


context_builder = ContextBuilderService()
