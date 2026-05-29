export interface User {
  id: string;
  email: string;
  full_name: string;
  auth_provider: string;
  profile_image_url?: string;
  gender_preference?: string;
  style_preference?: string;
  location?: string;
  favorite_colors?: string[];
  common_occasions?: string[];
  is_profile_complete: boolean;
  created_at: string;
}

export interface ClothingItemSummary {
  id: string;
  type: string;
  category: string;
  primary_color: string;
  front_image_url?: string;
}

export interface ClothingItem extends ClothingItemSummary {
  user_id: string;
  secondary_color?: string;
  brand?: string;
  size?: string;
  gender_fit?: string;
  material?: string;
  season?: string;
  occasion?: string;
  condition?: string;
  usage_frequency?: string;
  purchase_date?: string;
  price_range?: string;
  notes?: string;
  ai_detected: boolean;
  ai_confidence?: number;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
  back_image_url?: string;
  label_image_url?: string;
  thumbnail_url?: string;
}

export interface AIAnalysisResult {
  type: string;
  category: string;
  primary_color: string;
  secondary_color?: string;
  material?: string;
  brand?: string;
  season?: string;
  occasion?: string;
  gender_fit?: string;
  confidence: number;
}

export interface WeatherData {
  location: string;
  temperature: number;
  condition: string;
  humidity: number;
  wind_speed: number;
  season_hint: string;
  weather_key: string;
  clothing_advice: string;
  provider: string;
}

export interface RecommendedItem {
  id: string;
  type: string;
  category: string;
  primary_color: string;
  secondary_color?: string;
  brand?: string;
  material?: string;
  season?: string;
  condition?: string;
  front_image_key: string;
  front_image_url?: string;
  match_score: number;
  match_reasons: string[];
}

export interface OutfitRecommendationResponse {
  selected_item?: RecommendedItem;
  best_top_matches: RecommendedItem[];
  best_bottom_matches: RecommendedItem[];
  best_footwear_matches: RecommendedItem[];
  accessories_suggestions: RecommendedItem[];
  avoid_combinations: any[];
  explanation: string;
  outfit_score: number;
  insufficient_wardrobe: boolean;
  lipstick_suggestion?: string[];
  footwear_type_suggestion?: string[];
  accessory_suggestion?: string[];
}

export interface SavedOutfit {
  id: string;
  name: string;
  occasion?: string;
  season?: string;
  notes?: string;
  created_at: string;
  top_item?: ClothingItemSummary;
  bottom_item?: ClothingItemSummary;
  footwear_item?: ClothingItemSummary;
  accessory_item?: ClothingItemSummary;
}

export interface AnalyticsDashboard {
  total_items: number;
  category_distribution: Record<string, number>;
  total_outfits_saved: number;
  total_outfits_worn: number;
  most_worn_items: any[];
}
