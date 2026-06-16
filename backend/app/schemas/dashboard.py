from datetime import date
from pydantic import BaseModel
from typing import List, Dict, Any

from app.schemas.wardrobe import ClothingItemRead

class DistributionItem(BaseModel):
    name: str
    count: int

class WardrobeHealthMetrics(BaseModel):
    ai_coverage_percentage: int
    metadata_completeness_percentage: int
    category_balance: Dict[str, float]
    imbalance_flag: bool

class DashboardSummaryResponse(BaseModel):
    total_items: int
    categories: int
    unique_colors: int
    unique_brands: int
    ai_generated_items: int
    manual_items: int
    average_ai_confidence: int

    health_metrics: WardrobeHealthMetrics

    category_distribution: List[DistributionItem]
    color_distribution: List[DistributionItem]
    season_distribution: List[DistributionItem]
    brand_distribution: List[DistributionItem]

    recent_items: List[ClothingItemRead]

class ConfidenceTrendItem(BaseModel):
    date: str
    average_confidence: int

class CostPerWearStats(BaseModel):
    total_wears: int
    total_investment: float
    average_cost_per_wear: float
    most_valuable_item: ClothingItemRead | None
    least_utilized_item: ClothingItemRead | None

class WardrobeHealthReport(BaseModel):
    completeness_score: int
    diversity_score: int
    seasonal_score: int
    efficiency_score: int
    utilization_percentage: int
    unused_inventory: int
    gaps: List[str]
    weaknesses: List[str]
    recommendations: List[str]

class DashboardIntelligenceResponse(BaseModel):
    health: WardrobeHealthReport
    economics: CostPerWearStats
    outfit_success_rate: float


# ── Phase 6B: Predictive Intelligence Schemas ──

class WearTrendEntry(BaseModel):
    total_wears: int
    item_count: int

class WearAnalyticsResponse(BaseModel):
    most_worn: List[ClothingItemRead]
    least_worn: List[ClothingItemRead]
    underutilized_items: List[ClothingItemRead]
    favorite_colors: List[DistributionItem]
    favorite_categories: List[DistributionItem]
    wear_trends: Dict[str, WearTrendEntry]

class PurchaseRecommendation(BaseModel):
    id: str | None = None
    priority: str
    item_type: str
    reason: str
    expected_outfit_gain: int
    confidence_score: float

class PurchaseRecommendationsResponse(BaseModel):
    recommendations: List[PurchaseRecommendation]

class RotationInsightsResponse(BaseModel):
    rotation_score: int
    overused: List[ClothingItemRead]
    recommended_rotation: List[ClothingItemRead]
    insights: List[str]

class StyleDNAResponse(BaseModel):
    style_type: str
    confidence: int
    traits: List[str]
    dominant_colors: List[DistributionItem]
    preferred_categories: List[DistributionItem]
    formality: str
    seasonal_preference: str
    top_brand: str | None = None

class ForecastedCPW(BaseModel):
    current_cpw: float
    forecast_30d: float
    forecast_90d: float
    forecast_year: float
    forecast_confidence: int

class PredictiveInsightsResponse(BaseModel):
    rotation: RotationInsightsResponse
    style_dna: StyleDNAResponse
    forecasted_cpw: ForecastedCPW
