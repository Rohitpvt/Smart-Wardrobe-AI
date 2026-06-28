"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@clerk/nextjs";
import { api } from "@/lib/axios";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isLoaded, isSignedIn, getToken } = useAuth();
  const [mounted, setMounted] = useState(false);

  // We need to fetch the local user profile to check onboarding_completed
  const { data: user, isLoading: isUserLoading, isError, failureCount } = useQuery({
    queryKey: ["validate-session", isSignedIn],
    queryFn: async () => {
      // Ensure we have a token before making the request
      const token = await getToken();
      if (!token) throw new Error("No token");
      const response = await api.get("/users/me");
      return response.data;
    },
    enabled: isLoaded && isSignedIn,
    retry: 2,            // Retry up to 2 times to handle race conditions
    retryDelay: 1000,    // Wait 1s between retries
    refetchOnWindowFocus: true,
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && isLoaded) {
      if (!isSignedIn) {
        // Clerk confirms user is not signed in — redirect
        router.replace("/sign-in");
      } else if (!isUserLoading && isError && failureCount >= 2) {
        // Only redirect to sign-in if API failed multiple times AND Clerk says we're signed in
        // This prevents redirect loops during initialization
        // The user IS authenticated via Clerk but the backend can't be reached
        console.warn("[AuthGuard] Backend /users/me failed after retries. User is Clerk-authenticated but backend sync failed.");
        // Don't redirect to sign-in — that would cause a loop since Clerk says user IS signed in
        // Instead, show a degraded state or just let the page render
      } else if (user && user.onboarding_completed === false && !pathname.startsWith("/onboarding")) {
        router.replace("/onboarding/profile");
      }
    }
  }, [mounted, isLoaded, isSignedIn, isUserLoading, isError, failureCount, user, router, pathname]);

  // Handle loading state
  if (!mounted || !isLoaded || (isSignedIn && isUserLoading)) {
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

  if (!isSignedIn) {
    return null;
  }

  // Session is valid — render children even if backend sync had transient errors
  return <>{children}</>;
}

