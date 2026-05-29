"""
OpenWeatherMap Provider.

Fetches real weather data from the OpenWeatherMap API.
"""

from typing import Optional
from fastapi import HTTPException, status
import httpx
import logging

logger = logging.getLogger(__name__)

def get_openweather_data(location: Optional[str] = None, api_key: str = "") -> dict:
    """
    Fetch real weather data from OpenWeatherMap API.
    """
    if not api_key:
        logger.error("OpenWeatherMap API key is missing.")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="OpenWeatherMap API key is not configured."
        )

    loc = location or "Delhi"
    
    url = f"https://api.openweathermap.org/data/2.5/weather"
    params = {
        "q": loc,
        "appid": api_key,
        "units": "metric"
    }

    try:
        response = httpx.get(url, params=params, timeout=10.0)
    except Exception as e:
        logger.error(f"Failed to connect to OpenWeatherMap: {e}")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Failed to connect to weather service."
        )

    if response.status_code == 404:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"City not found: {loc}"
        )
    elif response.status_code != 200:
        logger.error(f"OpenWeatherMap API error: {response.text}")
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Weather service returned an error."
        )

    data = response.json()
    
    temp = data["main"]["temp"]
    condition = data["weather"][0]["main"]
    humidity = data["main"]["humidity"]
    wind_speed = data.get("wind", {}).get("speed", 0.0)
    
    # Determine season hint
    if temp > 28:
        season_hint = "Summer"
    elif temp < 15:
        season_hint = "Winter"
    elif condition.lower() in ["rain", "drizzle", "thunderstorm"]:
        season_hint = "Monsoon"
    else:
        season_hint = "Spring"
        
    # Determine weather key for recommendation engine
    if temp > 28:
        weather_key = "hot"
    elif temp < 15:
        weather_key = "cold"
    elif condition.lower() in ["rain", "drizzle", "thunderstorm"]:
        weather_key = "rainy"
    elif humidity > 70 and temp > 22:
        weather_key = "humid"
    else:
        weather_key = "mild"
        
    # Basic clothing advice
    if weather_key == "hot":
        advice = "It's hot outside! Wear light, breathable fabrics like cotton or linen."
    elif weather_key == "cold":
        advice = "Bundle up — it's cold! Layer with a hoodie or jacket."
    elif weather_key == "rainy":
        advice = "Rain expected! Wear quick-dry, dark-colored clothes and avoid white shoes."
    elif weather_key == "humid":
        advice = "Very humid today. Choose breathable cotton or linen in loose fits."
    else:
        advice = "Pleasant weather today. You can wear almost anything!"
        
    return {
        "location": data["name"],
        "temperature": round(temp),
        "condition": condition,
        "humidity": humidity,
        "wind_speed": round(wind_speed, 1),
        "season_hint": season_hint,
        "weather_key": weather_key,
        "clothing_advice": advice,
        "provider": "openweather",
    }
