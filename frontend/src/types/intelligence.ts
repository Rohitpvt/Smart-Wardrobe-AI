export interface IntelligenceFeedItem {
  id: string;
  item_type: "insight" | "alert" | "opportunity" | "coaching";
  feed_category: "operational" | "seasonal" | "behavioral" | "weather" | "opportunity";
  content: string;
  impact_score: number;
  confidence_score: number;
  action_payload?: Record<string, any>;
  source_services?: string[];
  is_read: number;
  created_at: string;
  expires_at?: string;
}

export interface WardrobeOpportunity {
  id: string;
  title: string;
  description?: string;
  impact_score: number;
  status: "active" | "completed" | "dismissed" | "expired";
  created_at: string;
  expires_at?: string;
}

export interface WardrobeGoal {
  id: string;
  title: string;
  goal_type: "rotation" | "cpw" | "diversity" | "category_growth" | "utilization";
  metric_target: number;
  current_progress: number;
  status: "active" | "completed";
  created_at: string;
}

export interface WeeklyReport {
  id: string;
  report_date: string;
  snapshot_json: {
    rotation_score: number;
    efficiency_score: number;
    average_cpw: number;
    style_dna?: any;
  };
  coaching_advice?: string;
}

export interface ReadinessScore {
  score: number;
  strengths: string[];
  gaps: string[];
  recommendations: string[];
}

export interface IntelligenceDashboardData {
  feed: IntelligenceFeedItem[];
  opportunities: WardrobeOpportunity[];
  goals: WardrobeGoal[];
  weekly_report?: WeeklyReport;
  readiness_scores?: Record<string, ReadinessScore>;
}

export interface IntelligenceDashboardResponse {
  success: boolean;
  data: IntelligenceDashboardData;
}

// --- Phase 9A Additions ---
export interface OutfitSuccessPrediction {
  success_probability: number;
  confidence: number;
  reasons: string[];
  improvement_suggestions: string[];
}

export interface StyleDNA {
  dominant_style: string;
  secondary_styles: string[];
  color_affinities: string[];
  fit_preferences: string[];
  brand_patterns: string[];
  style_confidence: number;
}

export interface WardrobeHealth {
  overall_score: number;
  grade: string;
  utilization_health: number;
  coverage_health: number;
  style_alignment: number;
  recommendation_effectiveness: number;
  financial_efficiency: number;
  future_readiness: number;
  strongest_area: string;
  weakest_area: string;
  top_improvement: string;
  projected_score_gain: number;
  score_delta: number;
  previous_score: number;
}

export interface UsageItem {
  id: string;
  name: string;
  image_url: string;
  worn_count: number;
  last_worn_at: string | null;
}

export interface UsageIntelligence {
  top_worn: UsageItem[];
  least_worn: UsageItem[];
  neglected_value: number;
  rotation_quality: number;
}

export interface SeasonalReadiness {
  season: string;
  readiness_score: number;
  missing_items: string[];
  recommended_purchases: string[];
}

export interface EvolutionTimelineEvent {
  date: string;
  event: string;
  description: string;
}

export interface FashionEvolution {
  timeline: EvolutionTimelineEvent[];
  major_changes: string[];
  growth_score: number;
}
