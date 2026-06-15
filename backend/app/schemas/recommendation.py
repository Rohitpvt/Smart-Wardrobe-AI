import uuid
from datetime import datetime
from typing import Literal
from pydantic import BaseModel, ConfigDict

from app.schemas.wardrobe import ClothingItemRead, PaginationMeta


OccasionEnum = Literal["CASUAL", "COLLEGE", "OFFICE", "PARTY", "FORMAL"]


class WeatherSnapshot(BaseModel):
    temperature_celsius: float | None = None
    condition: str | None = None
    city: str | None = None
    country_code: str | None = None
    humidity: int | None = None
    rain_probability: int | None = None
    uv_index: float | None = None
    wind_speed: float | None = None
    weather_used: bool
    generated_at: datetime | None = None

    model_config = ConfigDict(from_attributes=True)


class RecommendationGenerateRequest(BaseModel):
    occasion: OccasionEnum


class OutfitRecommendationRead(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    occasion: str
    top_item: ClothingItemRead | None = None
    bottom_item: ClothingItemRead | None = None
    footwear_item: ClothingItemRead | None = None
    ai_explanation: str
    weather_snapshot: WeatherSnapshot | None = None
    scores: dict | None = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class OutfitRecommendationResponse(BaseModel):
    success: bool = True
    data: OutfitRecommendationRead


class OutfitRecommendationListResponse(BaseModel):
    success: bool = True
    data: list[OutfitRecommendationRead]
    pagination: PaginationMeta

# ── Phase 7A: Feedback Schemas ──

FeedbackTypeEnum = Literal["like", "dislike", "love", "wore_it", "save_for_later", "removed_from_saved"]

class FeedbackRequest(BaseModel):
    feedback_type: FeedbackTypeEnum

class FeedbackRead(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    outfit_id: uuid.UUID
    feedback_type: str
    feedback_source: str
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)

class FeedbackHistoryResponse(BaseModel):
    success: bool = True
    data: list[FeedbackRead]
