export interface ROI_Breakdown {
  outfit_unlock_score: number;
  wardrobe_health_improvement: number;
  style_compatibility: number;
  seasonal_readiness: number;
}

export interface ShoppingOpportunity {
  item_name: string;
  category: string;
  color: string;
  opportunity_type: "essential_gap" | "high_outfit_unlock" | "high_wardrobe_health_improvement" | "seasonal_need" | "style_upgrade";
  priority_score: number;
  roi_score: number;
  outfits_unlocked: number;
  style_compatibility: number;
  roi_breakdown: ROI_Breakdown;
  why_this_item: string;
  expected_impact: string;
}

export interface ShoppingOpportunitiesResponse {
  success: boolean;
  data: ShoppingOpportunity[];
}
