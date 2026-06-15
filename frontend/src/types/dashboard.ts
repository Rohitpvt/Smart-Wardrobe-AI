export interface CategoryDistribution {
  name: string;
  count: number;
}

export interface SeasonDistribution {
  name: string;
  count: number;
}

export interface ColorDistribution {
  name: string;
  count: number;
}

export interface RecentWardrobeItem {
  id: string;
  name: string;
  category: string;
  image_url?: string;
  created_at: string;
}

export interface HealthMetrics {
  ai_coverage_percentage: number;
}

export interface DashboardSummary {
  total_items: number;
  categories: number;
  unique_brands: number;
  health_metrics: HealthMetrics;
  category_distribution: CategoryDistribution[];
  season_distribution: SeasonDistribution[];
  color_distribution: ColorDistribution[];
  recent_items: RecentWardrobeItem[];
  favorites_count: number;
}

export interface DashboardTrendData {
  date: string;
  confidence: number;
}

export type DashboardTrend = DashboardTrendData[];

export interface CostPerWearStats {
  total_wears: number;
  total_investment: number;
  average_cost_per_wear: number;
  most_valuable_item?: RecentWardrobeItem | null;
  least_utilized_item?: RecentWardrobeItem | null;
}

export interface WardrobeHealthReport {
  completeness_score: number;
  diversity_score: number;
  seasonal_score: number;
  efficiency_score: number;
  utilization_percentage: number;
  unused_inventory: number;
  gaps: string[];
  weaknesses: string[];
  recommendations: string[];
}

export interface DashboardIntelligenceResponse {
  health: WardrobeHealthReport;
  economics: CostPerWearStats;
  outfit_success_rate: number;
}

// ── Phase 6B: Predictive Intelligence Types ──

export interface DistributionItem {
  name: string;
  count: number;
}

export interface WearTrendEntry {
  total_wears: number;
  item_count: number;
}

export interface WearAnalyticsResponse {
  most_worn: RecentWardrobeItem[];
  least_worn: RecentWardrobeItem[];
  underutilized_items: RecentWardrobeItem[];
  favorite_colors: DistributionItem[];
  favorite_categories: DistributionItem[];
  wear_trends: Record<string, WearTrendEntry>;
}

export interface PurchaseRecommendation {
  priority: string;
  category: string;
  reason: string;
  expected_outfit_gain: number;
  confidence: number;
}

export interface PurchaseRecommendationsResponse {
  recommendations: PurchaseRecommendation[];
}

export interface RotationInsightsResponse {
  rotation_score: number;
  overused: RecentWardrobeItem[];
  recommended_rotation: RecentWardrobeItem[];
  insights: string[];
}

export interface StyleDNAResponse {
  style_type: string;
  confidence: number;
  traits: string[];
  dominant_colors: DistributionItem[];
  preferred_categories: DistributionItem[];
  formality: string;
  seasonal_preference: string;
  top_brand: string | null;
}

export interface ForecastedCPW {
  current_cpw: number;
  forecast_30d: number;
  forecast_90d: number;
  forecast_year: number;
  forecast_confidence: number;
}

export interface PredictiveInsightsResponse {
  rotation: RotationInsightsResponse;
  style_dna: StyleDNAResponse;
  forecasted_cpw: ForecastedCPW;
}

// ── Phase 7A: Taste Profile Types ──

export interface TasteProfileResponse {
  profile_name: string;
  confidence: number;
  personalization_score: number;
  favorite_colors: string[];
  favorite_categories: string[];
  style_evolution: string[];
  preference_weights: {
    colors: Record<string, number>;
    categories: Record<string, number>;
    formality: Record<string, number>;
    seasons: Record<string, number>;
  };
}
