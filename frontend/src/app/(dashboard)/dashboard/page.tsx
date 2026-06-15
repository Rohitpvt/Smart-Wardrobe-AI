import DashboardClient from "./dashboard-client";
import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";
import { 
  fetchDashboardSummaryServer, 
  fetchDashboardTrendServer, 
  fetchDashboardIntelligenceServer,
  fetchWearAnalyticsServer,
  fetchPurchaseRecommendationsServer,
  fetchPredictiveInsightsServer,
  fetchTasteProfileServer,
  fetchIntelligenceDashboardServer
} from "@/lib/server-api";

export const metadata = {
  title: "Dashboard | Wardrobe AI",
};

export default async function DashboardPage() {
  const queryClient = new QueryClient();

  await Promise.all([
    queryClient.prefetchQuery({
      queryKey: ["dashboard"],
      queryFn: fetchDashboardSummaryServer,
    }),
    queryClient.prefetchQuery({
      queryKey: ["dashboard-trend"],
      queryFn: fetchDashboardTrendServer,
    }),
    queryClient.prefetchQuery({
      queryKey: ["dashboard-intelligence"],
      queryFn: fetchDashboardIntelligenceServer,
    }),
    queryClient.prefetchQuery({
      queryKey: ["dashboard-analytics"],
      queryFn: fetchWearAnalyticsServer,
    }),
    queryClient.prefetchQuery({
      queryKey: ["dashboard-purchase-recs"],
      queryFn: fetchPurchaseRecommendationsServer,
    }),
    queryClient.prefetchQuery({
      queryKey: ["dashboard-predictive"],
      queryFn: fetchPredictiveInsightsServer,
    }),
    queryClient.prefetchQuery({
      queryKey: ["dashboard-taste-profile"],
      queryFn: fetchTasteProfileServer,
    }),
    queryClient.prefetchQuery({
      queryKey: ["intelligence-dashboard"],
      queryFn: fetchIntelligenceDashboardServer,
    }),
  ]);

  return (
    <>
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-white">Wardrobe Dashboard</h1>
        <p className="text-[#8c909f]">Your personal closet insights and analytics</p>
      </header>
      <HydrationBoundary state={dehydrate(queryClient)}>
        <DashboardClient />
      </HydrationBoundary>
    </>
  );
}
