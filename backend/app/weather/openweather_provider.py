"""
OpenWeatherMap Provider — Placeholder.

This file is a structural placeholder for future OpenWeatherMap API integration.
It will not work until a valid OPENWEATHER_API_KEY is set and the
implementation is completed.
"""

from typing import Optional
from fastapi import HTTPException, status


def get_openweather_data(location: Optional[str] = None, api_key: str = "") -> dict:
    """
    Fetch real weather data from OpenWeatherMap API.
    
    NOT YET IMPLEMENTED — raises 501.
    """
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail=(
            "OpenWeatherMap provider is not yet implemented. "
            "Set WEATHER_PROVIDER=mock in your .env to use mock weather data."
        ),
    )
