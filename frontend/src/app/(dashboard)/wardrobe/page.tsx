import WardrobeClient from "./wardrobe-client";
import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";
import { fetchDashboardSummaryServer, fetchWardrobeServer } from "@/lib/server-api";

export const metadata = {
  title: "Wardrobe | Wardrobe AI",
};

export default async function WardrobePage() {
  const queryClient = new QueryClient();

  // Prefetch dashboard summary (for KPI insights)
  await queryClient.prefetchQuery({
    queryKey: ["dashboard"],
    queryFn: fetchDashboardSummaryServer,
  });

  // Prefetch wardrobe page 1
  await queryClient.prefetchQuery({
    queryKey: ["wardrobe", { page: 1, pageSize: 20 }],
    queryFn: () => fetchWardrobeServer(1, 20),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <WardrobeClient />
    </HydrationBoundary>
  );
}
