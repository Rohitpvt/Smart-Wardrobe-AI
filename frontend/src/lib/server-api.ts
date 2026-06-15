import { cookies } from "next/headers";
import {
  DashboardSummary,
  DashboardTrend,
  DashboardIntelligenceResponse,
  WearAnalyticsResponse,
  PurchaseRecommendationsResponse,
  PredictiveInsightsResponse,
  TasteProfileResponse,
} from "@/types/dashboard";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api/v1";

async function fetchWithAuth(endpoint: string) {
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;

  const res = await fetch(`${API_URL}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    // Prevent Next.js from aggressively caching authenticated data globally
    cache: "no-store", 
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch ${endpoint}`);
  }

  return res.json();
}

export async function fetchDashboardSummaryServer(): Promise<DashboardSummary> {
  return fetchWithAuth("/dashboard");
}

export async function fetchDashboardTrendServer(): Promise<DashboardTrend> {
  return fetchWithAuth("/dashboard/confidence-trend");
}

export async function fetchDashboardIntelligenceServer(): Promise<DashboardIntelligenceResponse> {
  return fetchWithAuth("/dashboard/intelligence");
}

export async function fetchWearAnalyticsServer(): Promise<WearAnalyticsResponse> {
  return fetchWithAuth("/dashboard/analytics");
}

export async function fetchPurchaseRecommendationsServer(): Promise<PurchaseRecommendationsResponse> {
  return fetchWithAuth("/dashboard/recommendations/purchases");
}

export async function fetchPredictiveInsightsServer(): Promise<PredictiveInsightsResponse> {
  return fetchWithAuth("/dashboard/predictive");
}

export async function fetchTasteProfileServer(): Promise<TasteProfileResponse> {
  return fetchWithAuth("/dashboard/taste-profile");
}

export async function fetchWardrobeServer(page: number = 1, pageSize: number = 20) {
  return fetchWithAuth(`/wardrobe?page=${page}&page_size=${pageSize}`);
}

export async function fetchRecommendationsServer(page: number = 1, pageSize: number = 10) {
  return fetchWithAuth(`/recommendations?page=${page}&page_size=${pageSize}`);
}

import { IntelligenceDashboardData } from "@/types/intelligence";

export async function fetchUserProfileServer() {
  return fetchWithAuth(`/users/me`);
}

export async function fetchIntelligenceDashboardServer(): Promise<IntelligenceDashboardData> {
  return fetchWithAuth("/intelligence/dashboard");
}
