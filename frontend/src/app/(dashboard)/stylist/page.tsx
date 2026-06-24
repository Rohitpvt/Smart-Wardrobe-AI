import StylistClient from "./stylist-client";
import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import { cookies } from "next/headers";
import AIFeatureLock from "@/components/ui/AIFeatureLock";

export const metadata = {
  title: "AI Stylist | Wardrobe AI",
};

export default async function StylistPage() {
  const queryClient = new QueryClient();

  // We can try to prefetch chat sessions if possible
  // Using a try-catch because if server fetching fails, client can retry
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("access_token")?.value;
    if (token) {
      await queryClient.prefetchQuery({
        queryKey: ["chat-sessions"],
        queryFn: async () => {
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/chat/sessions`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (!res.ok) throw new Error("Failed to fetch");
          const json = await res.json();
          return json.data;
        }
      });
    }
  } catch (err) {
    // Ignore server prefetch errors for auth endpoints
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <AIFeatureLock>
        <StylistClient />
      </AIFeatureLock>
    </HydrationBoundary>
  );
}
