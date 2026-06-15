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
