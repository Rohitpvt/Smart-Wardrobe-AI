import logging
from datetime import datetime
import httpx
from cachetools import TTLCache
from pydantic import BaseModel, ConfigDict
import json

from app.core.config import settings

logger = logging.getLogger(__name__)

class WeatherContext(BaseModel):
    temperature_celsius: float | None = None
    condition: str | None = None
    city: str | None = None
    humidity: int | None = None
    rain_probability: int | None = None
    uv_index: float | None = None
    wind_speed: float | None = None
    weather_used: bool = False
    
    model_config = ConfigDict(from_attributes=True)

# 30-minute cache: TTL = 1800 seconds
weather_cache = TTLCache(maxsize=1000, ttl=1800)

class OpenWeatherService:
    def __init__(self):
        self.api_key = settings.OPENWEATHER_API_KEY
        self.base_url = "https://api.openweathermap.org/data/2.5/weather"
        self.redis_client = None
        if settings.REDIS_URL:
            try:
                import redis.asyncio as redis
                self.redis_client = redis.from_url(settings.REDIS_URL, decode_responses=True)
            except Exception as e:
                logger.warning(f"Failed to initialize Redis for weather cache: {e}")

    async def get_current_weather(
        self, 
        city: str | None, 
        country_code: str | None,
        lat: float | None = None,
        lon: float | None = None,
        weather_location_enabled: bool = True
    ) -> WeatherContext:
        """
        Fetch current weather for a specific location.
        Returns a WeatherContext. Never raises exceptions (graceful fallback).
        """
        if not weather_location_enabled:
            return WeatherContext(weather_used=False)
            
        if not lat and not lon and not city:
            return WeatherContext(weather_used=False)

        # Build cache key
        country_str = country_code or ""
        if lat and lon:
            cache_key = f"weather:coords:{round(lat, 2)}:{round(lon, 2)}"
        else:
            cache_key = f"weather:{city.lower().strip()}:{country_str.lower().strip()}"
        
        
        # 1. Try Redis
        if self.redis_client:
            try:
                cached_json = await self.redis_client.get(cache_key)
                if cached_json:
                    return WeatherContext.model_validate(json.loads(cached_json))
            except Exception as e:
                logger.warning(f"Redis get failed: {e}")
        
        # 2. Try TTLCache fallback
        if cache_key in weather_cache:
            return weather_cache[cache_key]
            
        if not self.api_key:
            logger.warning("OpenWeather API key not configured. Skipping weather lookup.")
            return WeatherContext(weather_used=False)

        params = {
            "appid": self.api_key,
            "units": "metric"
        }
        if lat and lon:
            params["lat"] = lat
            params["lon"] = lon
        else:
            q = city
            if country_code:
                q = f"{city},{country_code}"
            params["q"] = q

        try:
            async with httpx.AsyncClient(timeout=3.0) as client:
                response = await client.get(
                    self.base_url,
                    params=params
                )
                
                if response.status_code == 200:
                    data = response.json()
                    temp = data.get("main", {}).get("temp")
                    humidity = data.get("main", {}).get("humidity")
                    wind_speed = data.get("wind", {}).get("speed")
                    weather_list = data.get("weather", [])
                    condition = weather_list[0].get("main") if weather_list else None
                    
                    rain_prob = 0
                    if condition in ["Rain", "Drizzle", "Thunderstorm"]:
                        rain_prob = 80
                    elif condition == "Clouds":
                        rain_prob = 20
                        
                    uv_index = 5.0 # default moderate
                    if condition == "Clear" and temp and temp > 20:
                        uv_index = 8.0
                    
                    weather_ctx = WeatherContext(
                        temperature_celsius=temp,
                        condition=condition,
                        city=data.get("name", city),
                        humidity=humidity,
                        wind_speed=wind_speed,
                        rain_probability=rain_prob,
                        uv_index=uv_index,
                        weather_used=True
                    )
                    
                    # 3. Store in caches
                    try:
                        if self.redis_client:
                            await self.redis_client.setex(cache_key, 1800, json.dumps(weather_ctx.model_dump()))
                    except Exception as e:
                        logger.warning(f"Redis set failed: {e}")
                        
                    weather_cache[cache_key] = weather_ctx
                    return weather_ctx
                else:
                    logger.error(f"OpenWeather API returned status {response.status_code}: {response.text}")
                    return WeatherContext(weather_used=False)
                    
        except Exception as e:
            logger.error(f"Failed to fetch weather data: {e}")
            return WeatherContext(weather_used=False)

weather_service = OpenWeatherService()
