import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";
import OutfitHistoryClient from "./outfit-history-client";

export const metadata = {
  title: "Outfit History | Wardrobe AI",
};

export default async function OutfitHistoryPage() {
  const queryClient = new QueryClient();

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <OutfitHistoryClient />
    </HydrationBoundary>
  );
}
