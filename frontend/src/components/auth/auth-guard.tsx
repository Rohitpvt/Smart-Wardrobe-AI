"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/axios";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  // Use TanStack query to validate session against the backend
  const { data: user, isLoading, isError } = useQuery({
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
    if (mounted && !isLoading) {
      if (isError) {
        router.replace("/login");
      } else if (user && user.onboarding_completed === false) {
        router.replace("/onboarding/profile");
      }
    }
  }, [mounted, isLoading, isError, user, router]);

  // Handle loading state
  if (!mounted || isLoading) {
    return (
      <div className="flex flex-col h-screen w-full items-center justify-center bg-[#02040a] relative overflow-hidden">
        {/* Ambient background effect */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-brand-purple/5 blur-[120px] rounded-full" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-brand-blue/5 blur-[80px] rounded-full" />
        
        {/* Premium loader */}
        <div className="relative z-10 flex flex-col items-center gap-6">
          <div className="w-16 h-16 rounded-2xl bg-surface-2 border border-white/10 flex items-center justify-center shadow-2xl relative overflow-hidden">
            <div className="absolute inset-0 skeleton-shimmer opacity-50" />
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-white relative z-10">
              <path d="M12 2L3 7L12 12L21 7L12 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M3 17L12 22L21 17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M3 12L12 17L21 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="h-4 w-32 bg-surface-2 rounded skeleton-shimmer" />
            <div className="h-3 w-24 bg-surface-2/50 rounded skeleton-shimmer" />
          </div>
        </div>
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
