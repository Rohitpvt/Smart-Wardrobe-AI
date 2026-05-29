"""
Weather Service — Provider Factory.

Selects the correct weather provider based on WEATHER_PROVIDER env var.
Defaults to mock for seamless local development.
"""

from typing import Optional
from app.config import settings
from app.weather.mock_weather import get_mock_weather
from app.weather.openweather_provider import get_openweather_data


def get_weather_provider():
    """Return the provider name string."""
    return getattr(settings, "WEATHER_PROVIDER", "mock").lower()


def get_current_weather(location: Optional[str] = None) -> dict:
    """
    Get current weather data using the configured provider.
    
    Returns a standardized dict with:
    - location, temperature, condition, humidity,
      season_hint, weather_key, clothing_advice, provider
    """
    provider = get_weather_provider()

    if provider == "openweather":
        api_key = getattr(settings, "OPENWEATHER_API_KEY", "")
        return get_openweather_data(location=location, api_key=api_key)
    elif provider == "mock":
        return get_mock_weather(location=location)
    else:
        raise ValueError(f"Unknown WEATHER_PROVIDER: {provider}")
