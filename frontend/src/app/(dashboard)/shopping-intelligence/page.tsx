import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";
import ShoppingIntelligenceClient from "./shopping-intelligence-client";

export const metadata = {
  title: "Shopping Intelligence | Wardrobe AI",
};

export default async function ShoppingIntelligencePage() {
  const queryClient = new QueryClient();

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ShoppingIntelligenceClient />
    </HydrationBoundary>
  );
}
