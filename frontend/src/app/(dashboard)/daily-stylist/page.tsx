import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";
import DailyStylistClient from "./daily-stylist-client";

export const metadata = {
  title: "Daily Stylist | Wardrobe AI",
};

export default async function DailyStylistPage() {
  const queryClient = new QueryClient();

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <DailyStylistClient />
    </HydrationBoundary>
  );
}
