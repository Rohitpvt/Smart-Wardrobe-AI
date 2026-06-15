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
