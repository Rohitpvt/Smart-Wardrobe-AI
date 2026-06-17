export interface WeatherSnapshot {
  temperature_celsius: number | null;
  condition: string | null;
  city: string | null;
  country_code: string | null;
  humidity: number | null;
  rain_probability: number | null;
  uv_index: number | null;
  wind_speed: number | null;
  weather_used: boolean;
  generated_at: string;
}

export interface ClothingItemMinimal {
  id: string;
  name: string;
  category: string;
  color: string;
  image_url: string;
  season: string | null;
}

export interface OutfitRecommendation {
  id: string;
  user_id: string;
  occasion: string;
  top_item: ClothingItemMinimal;
  bottom_item: ClothingItemMinimal;
  footwear_item: ClothingItemMinimal;
  ai_explanation: string;
  weather_snapshot: WeatherSnapshot | null;
  scores?: {
    overall_score: number;
    color_score: number;
    weather_score: number;
    occasion_score: number;
    season_score: number;
    utilization_score: number;
    score_metadata: Record<string, any>;
  } | null;
  created_at: string;
  updated_at: string;
}

export interface GenerateRecommendationRequest {
  occasion: string;
}

export interface RecommendationListResponse {
  success: boolean;
  data: OutfitRecommendation[];
  pagination: {
    page: number;
    page_size: number;
    total_items: number;
    total_pages: number;
  };
}

export interface GenerateRecommendationResponse {
  success: boolean;
  data: OutfitRecommendation;
}

// Phase 9B additions
export interface RecommendationSignals {
  style_alignment: number;
  weather_alignment: number;
  rotation_benefit: number;
  seasonal_alignment: number;
}

export interface RecommendationReasoning {
  primary_reason: string;
  supporting_reasons: string[];
}

export interface RecommendationExplanation {
  outfit_id?: string;
  confidence: number;
  success_probability: number;
  reasoning: RecommendationReasoning;
  signals: RecommendationSignals;
  improvement_suggestions: string[];
}

export interface RecommendationTrace {
  style_dna_used: boolean;
  usage_intelligence_used: boolean;
  seasonal_readiness_used: boolean;
  outfit_prediction_used: boolean;
}

export interface ExplainableRecommendationItem {
  recommendation: {
    top: ClothingItemMinimal;
    bottom: ClothingItemMinimal;
    shoes: ClothingItemMinimal;
    outerwear?: ClothingItemMinimal;
  };
  explanation: RecommendationExplanation;
  trace: RecommendationTrace;
}

export interface ExplainableRecommendationRequest {
  occasion: string;
  generation_mode: 'standard' | 'anchor';
  anchor_item_id?: string;
}

export interface ExplainableRecommendationResponse {
  recommendations: ExplainableRecommendationItem[];
}
