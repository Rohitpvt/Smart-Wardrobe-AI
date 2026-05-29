"""
Weather API Endpoints.

GET  /api/v1/weather/current     — Get current weather for a location
POST /api/v1/weather/outfit      — Get weather-aware outfit recommendation
"""

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import Optional
import logging

from app.core.dependencies import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.models.clothing import ClothingItem
from app.schemas.weather import WeatherResponse, WeatherOutfitRequest
from app.schemas.recommendation import OutfitRecommendationResponse
from app.weather.service import get_current_weather
from app.recommendations.engine import generate_recommendation
from app.api.v1.recommendations import _model_to_dict, _inject_image_urls

logger = logging.getLogger(__name__)
weather_router = APIRouter()


@weather_router.get("/current", response_model=WeatherResponse)
async def get_weather(
    location: Optional[str] = Query(None, description="City or location name"),
    current_user: User = Depends(get_current_user),
):
    """
    Get current weather data for a location.
    Uses the user's profile location as fallback if no location is provided.
    """
    loc = location or current_user.location or "Delhi"
    weather_data = get_current_weather(location=loc)
    return weather_data


@weather_router.post("/outfit", response_model=OutfitRecommendationResponse)
async def get_weather_outfit(
    request: WeatherOutfitRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Generate a weather-aware outfit recommendation.
    
    1. Fetches current weather for the location
    2. Maps weather to recommendation engine's weather parameter
    3. Runs the full recommendation engine with weather context
    """
    # 1. Get weather
    loc = request.location or current_user.location or "Delhi"
    weather_data = get_current_weather(location=loc)
    weather_key = weather_data.get("weather_key", "mild")

    # 2. Fetch user's active wardrobe
    result = await db.execute(
        select(ClothingItem).where(
            ClothingItem.user_id == current_user.id,
            ClothingItem.is_deleted == False,
        )
    )
    items = result.scalars().all()

    if not items:
        return OutfitRecommendationResponse(
            explanation="Your wardrobe is empty. Upload some clothing items to get weather-based outfit suggestions!",
            outfit_score=0,
            insufficient_wardrobe=True,
        )

    # 3. Convert and run engine
    wardrobe_dicts = [_model_to_dict(item) for item in items]

    recommendation = generate_recommendation(
        wardrobe_items=wardrobe_dicts,
        occasion=request.occasion,
        weather=weather_key,
        gender_style=request.gender_style,
        user_gender_preference=current_user.gender_preference,
    )

    # 4. Inject S3 URLs
    recommendation = _inject_image_urls(recommendation)

    # 5. Enhance explanation with weather context
    weather_prefix = (
        f"Weather in {weather_data['location']}: "
        f"{weather_data['temperature']}°C, {weather_data['condition']} "
        f"(Humidity: {weather_data['humidity']}%). "
        f"{weather_data['clothing_advice']} "
    )
    recommendation["explanation"] = weather_prefix + recommendation.get("explanation", "")

    return recommendation
