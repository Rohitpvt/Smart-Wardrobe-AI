import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import {
  DashboardSummary,
  DashboardTrend,
  DashboardIntelligenceResponse,
  WearAnalyticsResponse,
  PurchaseRecommendationsResponse,
  PredictiveInsightsResponse,
  TasteProfileResponse,
} from "@/types/dashboard";

export function useDashboard() {
  const dashboardQuery = useQuery({
    queryKey: ["dashboard"],
    queryFn: async (): Promise<DashboardSummary> => {
      const response = await api.get("/dashboard");
      return response.data;
    },
  });

  const trendQuery = useQuery({
    queryKey: ["dashboard-trend"],
    queryFn: async (): Promise<DashboardTrend> => {
      const response = await api.get("/dashboard/confidence-trend");
      return response.data;
    },
  });

  const intelligenceQuery = useQuery({
    queryKey: ["dashboard-intelligence"],
    queryFn: async (): Promise<DashboardIntelligenceResponse> => {
      const response = await api.get("/dashboard/intelligence");
      return response.data;
    },
  });

  const analyticsQuery = useQuery({
    queryKey: ["dashboard-analytics"],
    queryFn: async (): Promise<WearAnalyticsResponse> => {
      const response = await api.get("/dashboard/analytics");
      return response.data;
    },
  });

  const purchaseRecsQuery = useQuery({
    queryKey: ["dashboard-purchase-recs"],
    queryFn: async (): Promise<PurchaseRecommendationsResponse> => {
      const response = await api.get("/dashboard/recommendations/purchases");
      return response.data;
    },
  });

  const predictiveQuery = useQuery({
    queryKey: ["dashboard-predictive"],
    queryFn: async (): Promise<PredictiveInsightsResponse> => {
      const response = await api.get("/dashboard/predictive");
      return response.data;
    },
  });

  const tasteProfileQuery = useQuery({
    queryKey: ["dashboard-taste-profile"],
    queryFn: async (): Promise<TasteProfileResponse> => {
      const response = await api.get("/dashboard/taste-profile");
      return response.data;
    },
  });

  return {
    dashboard: dashboardQuery,
    trend: trendQuery,
    intelligence: intelligenceQuery,
    analytics: analyticsQuery,
    purchaseRecs: purchaseRecsQuery,
    predictive: predictiveQuery,
    tasteProfile: tasteProfileQuery,
  };
}
