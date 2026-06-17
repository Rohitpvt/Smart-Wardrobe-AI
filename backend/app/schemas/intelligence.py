from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional

# 1. Outfit Success Prediction
class OutfitSuccessPredictionResponse(BaseModel):
    success_probability: int = Field(..., ge=0, le=100, description="0-100 probability of outfit success")
    confidence: int = Field(..., ge=0, le=100, description="0-100 confidence in the prediction")
    reasons: List[str] = Field(default_factory=list, description="Reasons for the score")
    improvement_suggestions: List[str] = Field(default_factory=list, description="Actionable improvement suggestions")

# 2. Personal Style DNA
class StyleDNAResponse(BaseModel):
    dominant_style: str = Field(..., description="The user's primary style archetype")
    secondary_styles: List[str] = Field(default_factory=list, description="Secondary style influences")
    color_affinities: List[str] = Field(default_factory=list, description="Top preferred colors")
    fit_preferences: List[str] = Field(default_factory=list, description="Preferred fit styles (e.g., Slim, Oversized)")
    brand_patterns: List[str] = Field(default_factory=list, description="Top brands worn")
    style_confidence: int = Field(..., ge=0, le=100, description="0-100 score of how consistent the user's style is")

# 3. Wardrobe Health Score 2.0
class WardrobeHealthResponse(BaseModel):
    overall_score: int = Field(..., ge=0, le=100)
    grade: str
    utilization_health: int
    coverage_health: int
    style_alignment: int
    recommendation_effectiveness: int
    financial_efficiency: int
    future_readiness: int
    strongest_area: str
    weakest_area: str
    top_improvement: str
    projected_score_gain: int
    score_delta: int
    previous_score: int

# 4. Usage Pattern Intelligence
class UsageItem(BaseModel):
    id: str
    name: str
    image_url: str
    worn_count: int
    last_worn_at: Optional[str] = None

class UsageIntelligenceResponse(BaseModel):
    top_worn: List[UsageItem] = Field(default_factory=list, description="Most frequently worn items")
    least_worn: List[UsageItem] = Field(default_factory=list, description="Least worn or neglected items")
    neglected_value: float = Field(..., description="Estimated monetary value of unworn items")
    rotation_quality: int = Field(..., ge=0, le=100, description="0-100 score of how well items are rotated")

# 5. Seasonal Readiness Analysis
class SeasonalReadinessResponse(BaseModel):
    season: str = Field(..., description="The upcoming or current season being analyzed")
    readiness_score: int = Field(..., ge=0, le=100, description="0-100 readiness score")
    missing_items: List[str] = Field(default_factory=list, description="Essential items missing for the season")
    recommended_purchases: List[str] = Field(default_factory=list, description="Suggested items to buy")

# 6. Fashion Evolution Tracking
class EvolutionTimelineEvent(BaseModel):
    date: str
    event: str
    description: str

class FashionEvolutionResponse(BaseModel):
    timeline: List[EvolutionTimelineEvent] = Field(default_factory=list, description="Chronological style events")
    major_changes: List[str] = Field(default_factory=list, description="Summary of significant shifts in style")
    growth_score: int = Field(..., ge=0, le=100, description="0-100 score of wardrobe improvement over time")
