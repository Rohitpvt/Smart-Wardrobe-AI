import RecommendationsClient from "./recommendations-client";
import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";
import { fetchRecommendationsServer } from "@/lib/server-api";

export const metadata = {
  title: "AI Stylist | Wardrobe AI",
};

export default async function RecommendationsPage() {
  const queryClient = new QueryClient();

  // Prefetch recommendations page 1
  await queryClient.prefetchQuery({
    queryKey: ["recommendations", { page: 1, pageSize: 10 }],
    queryFn: () => fetchRecommendationsServer(1, 10),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <RecommendationsClient />
    </HydrationBoundary>
  );
}
