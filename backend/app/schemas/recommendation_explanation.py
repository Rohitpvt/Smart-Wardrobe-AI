from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional

class RecommendationSignals(BaseModel):
    style_alignment: int = Field(..., ge=0, le=100)
    weather_alignment: int = Field(..., ge=0, le=100)
    rotation_benefit: int = Field(..., ge=0, le=100)
    seasonal_alignment: int = Field(..., ge=0, le=100)

class RecommendationReasoning(BaseModel):
    primary_reason: str = Field(..., description="Maximum 1 sentence")
    supporting_reasons: List[str] = Field(default_factory=list, description="Maximum 4 items")

class RecommendationExplanation(BaseModel):
    outfit_id: Optional[str] = None
    confidence: int = Field(..., ge=0, le=100)
    success_probability: int = Field(..., ge=0, le=100)
    reasoning: RecommendationReasoning
    signals: RecommendationSignals
    improvement_suggestions: List[str] = Field(default_factory=list, description="Maximum 3 items")

class RecommendationTrace(BaseModel):
    style_dna_used: bool = False
    usage_intelligence_used: bool = False
    seasonal_readiness_used: bool = False
    outfit_prediction_used: bool = False

class ExplainableRecommendationItem(BaseModel):
    # This will hold the existing recommendation payload dictionary
    recommendation: Dict[str, Any]
    explanation: RecommendationExplanation
    trace: RecommendationTrace

class ExplainableRecommendationRequest(BaseModel):
    occasion: str = Field(..., description="The occasion for the outfit")
    generation_mode: str = Field(..., description="'standard' or 'anchor'")
    anchor_item_id: Optional[str] = None

class ExplainableRecommendationResponse(BaseModel):
    recommendations: List[ExplainableRecommendationItem]
