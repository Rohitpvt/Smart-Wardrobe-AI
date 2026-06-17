import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";
import StyleMemoryClient from "./style-memory-client";
import { headers } from "next/headers";
import { api } from "@/lib/axios";

export const metadata = {
  title: "Style Memory | Wardrobe AI",
};

export default async function StyleMemoryPage() {
  const queryClient = new QueryClient();

  // Prefetch data if possible, though we rely on client fetching primarily here
  // Could inject cookies for SSR api call, but client side is fine for now

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <StyleMemoryClient />
    </HydrationBoundary>
  );
}
