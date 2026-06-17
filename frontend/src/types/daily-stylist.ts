export interface WeatherContext {
  temperature: number | null;
  condition: string | null;
  suitability_score: number;
  notes: string;
}

export interface RecommendedOutfit {
  top: Record<string, any>;
  bottom: Record<string, any>;
  shoes: Record<string, any>;
  outerwear?: Record<string, any>;
}

export interface DailyStyleBrief {
  date: string;
  weather: WeatherContext;
  recommended_outfit: RecommendedOutfit;
  confidence: number;
  style_tip: string;
  daily_insight: string;
  consecutive_days: number;
}

export interface DailyStylistResponse {
  success: boolean;
  brief?: DailyStyleBrief;
  error_code?: string;
  message?: string;
}
