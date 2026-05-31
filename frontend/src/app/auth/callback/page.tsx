"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Spinner } from "@/components/ui/Spinner";

function CallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();

  useEffect(() => {
    const token = searchParams.get("token");
    if (token) {
      // Store token in local storage using the login function from useAuth
      login(token);
      router.push("/dashboard");
    } else {
      // If no token is provided, redirect to login page
      router.push("/login?error=auth_failed");
    }
  }, [searchParams, login, router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-inkwell relative">
      <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] bg-cyber-cyan/[0.03] rounded-full blur-[120px] pointer-events-none" />
      <div className="z-10 flex flex-col items-center text-center">
        <Spinner size="lg" className="mb-4" />
        <h1 className="text-xl font-bold text-porcelain mb-1">Authenticating...</h1>
        <p className="text-sm text-cloudburst">Please wait while we log you in.</p>
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-inkwell">
        <Spinner size="lg" />
      </div>
    }>
      <CallbackContent />
    </Suspense>
  );
}
