"""
Pydantic schemas for weather API requests and responses.
"""

from pydantic import BaseModel, Field
from typing import Optional, List


class WeatherResponse(BaseModel):
    location: str
    temperature: int
    condition: str
    humidity: int
    season_hint: str
    weather_key: str  # hot, cold, rainy, mild, humid — maps to recommendation engine
    clothing_advice: str
    provider: str = "mock"


class WeatherOutfitRequest(BaseModel):
    location: Optional[str] = Field(None, description="City or location name for weather lookup.")
    occasion: Optional[str] = Field(None, description="Occasion context, e.g. 'Casual', 'Formal'.")
    gender_style: Optional[str] = Field(None, description="Gender style preference, e.g. 'Men', 'Women'.")
