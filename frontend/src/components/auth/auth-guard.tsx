"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/axios";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  // Use TanStack query to validate session against the backend
  const { isLoading, isError } = useQuery({
    queryKey: ["validate-session"],
    queryFn: async () => {
      const response = await api.get("/users/me");
      return response.data;
    },
    // Don't retry, because if it's 401, axios will either refresh or redirect.
    retry: false,
    refetchOnWindowFocus: true,
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !isLoading && isError) {
      router.replace("/login");
    }
  }, [mounted, isLoading, isError, router]);

  // Handle loading state
  if (!mounted || isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#10131a]">
        <div className="w-12 h-12 border-4 border-[#3b82f6] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // If there's an error, Axios interceptor will handle the redirect. We just prevent rendering children.
  if (isError) {
    return null;
  }

  // Session is valid
  return <>{children}</>;
}
