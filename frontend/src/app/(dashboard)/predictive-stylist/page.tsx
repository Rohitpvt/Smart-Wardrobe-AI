import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";
import PredictiveStylistClient from "./predictive-stylist-client";

export const metadata = {
  title: "Predictive Stylist | Wardrobe AI",
};

export default async function PredictiveStylistPage() {
  const queryClient = new QueryClient();

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <PredictiveStylistClient />
    </HydrationBoundary>
  );
}
