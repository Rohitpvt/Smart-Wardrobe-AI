"""
Pydantic schemas for outfit recommendation requests and responses.
"""

from pydantic import BaseModel, Field
from typing import Optional, List


class OutfitRequest(BaseModel):
    selected_item_id: Optional[str] = Field(None, description="UUID of the anchor clothing item.")
    preferred_type: Optional[str] = Field(None, description="Preferred clothing type to start from, e.g. 'Shirt'.")
    occasion: Optional[str] = Field(None, description="Occasion context, e.g. 'Casual', 'Formal'.")
    weather: Optional[str] = Field(None, description="Weather/season, e.g. 'Hot', 'Cold', 'Rainy'.")
    gender_style: Optional[str] = Field(None, description="Gender style preference, e.g. 'Men', 'Women'.")


class RecommendedItem(BaseModel):
    id: str
    type: str
    category: str
    primary_color: str
    secondary_color: Optional[str] = None
    brand: Optional[str] = None
    material: Optional[str] = None
    season: Optional[str] = None
    condition: Optional[str] = None
    front_image_key: str = ""
    front_image_url: Optional[str] = None  # Injected by the API layer
    match_score: float = 0
    match_reasons: List[str] = []


class AvoidCombination(BaseModel):
    item: RecommendedItem
    reason: str


class OutfitRecommendationResponse(BaseModel):
    selected_item: Optional[RecommendedItem] = None
    best_top_matches: List[RecommendedItem] = []
    best_bottom_matches: List[RecommendedItem] = []
    best_footwear_matches: List[RecommendedItem] = []
    accessories_suggestions: List[RecommendedItem] = []
    avoid_combinations: List[AvoidCombination] = []
    explanation: str = ""
    outfit_score: float = 0
    insufficient_wardrobe: bool = False

    # Women-specific (optional)
    lipstick_suggestion: Optional[List[str]] = None
    footwear_type_suggestion: Optional[List[str]] = None
    accessory_suggestion: Optional[List[str]] = None
