'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState } from 'react';

import { MotionConfig, LazyMotion, domAnimation } from 'framer-motion';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AiQuotaProvider } from '@/components/providers/ai-quota-provider';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      })
  );

  return (
    <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ""}>
      <QueryClientProvider client={queryClient}>
        <LazyMotion features={domAnimation} strict>
          <MotionConfig reducedMotion="user">
            <AiQuotaProvider>
              {children}
            </AiQuotaProvider>
            <ReactQueryDevtools initialIsOpen={false} />
          </MotionConfig>
        </LazyMotion>
      </QueryClientProvider>
    </GoogleOAuthProvider>
  );
}
