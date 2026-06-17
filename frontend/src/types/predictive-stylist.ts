export interface PredictiveInsight {
  type: "underutilized_value" | "neglected_items" | "wardrobe_gap" | "rotation_risk" | "outfit_unlock";
  insight: string;
  why_it_matters: string;
  recommended_action: string;
  priority_score: number;
  global_priority: number;
  item_id?: string;
  item_name?: string;
  image_url?: string;
  category?: string;
}

export interface PredictiveInsightsResponse {
  success: boolean;
  data: {
    top_priority_insight: PredictiveInsight | null;
    all_insights: PredictiveInsight[];
  };
}

export interface PredictiveOpportunitiesResponse {
  success: boolean;
  data: {
    gaps: PredictiveInsight[];
    unlocks: PredictiveInsight[];
  };
}

export interface UtilizationHeatmapData {
  category: string;
  avg_worn: number;
}

export interface PredictiveForecastResponse {
  success: boolean;
  data: {
    forecast_risks: PredictiveInsight[];
    heatmap_data: UtilizationHeatmapData[];
  };
}
