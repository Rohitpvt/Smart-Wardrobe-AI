export type WearSourceType = "MANUAL" | "RECOMMENDATION" | "DAILY_STYLIST" | "SAVED_OUTFIT";

export interface LogWearEventPayload {
  clothing_item_ids: string[];
  worn_at: string;
  source_type: WearSourceType;
  occasion?: string;
  notes?: string;
  season?: string;
}

export interface WornItem {
  id: string;
  name: string;
  category: string;
  image_url: string;
}

export interface WearGroup {
  wear_group_id: string;
  worn_at: string;
  source_type: WearSourceType;
  occasion: string | null;
  season: string | null;
  items: WornItem[];
}

export interface OutfitHistoryResponse {
  success: boolean;
  data: WearGroup[];
}

export interface HeatmapData {
  date: string;
  count: number;
}

export interface WearAnalyticsResponse {
  success: boolean;
  data: {
    heatmap: HeatmapData[];
    total_wears_logged: number;
  };
}

export interface RepetitionWarning {
  item_name: string;
  image_url: string;
  warning: string;
  type: string;
}

export interface CostPerWearMetric {
  item_id: string;
  name: string;
  category: string;
  purchase_price: number;
  worn_count: number;
  cpw: number;
}

export interface RepetitionResponse {
  success: boolean;
  data: {
    repetition_warnings: RepetitionWarning[];
    cost_per_wear: {
      best_value: CostPerWearMetric[];
      worst_value: CostPerWearMetric[];
      all_metrics: CostPerWearMetric[];
    }
  };
}
