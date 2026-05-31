"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Spinner } from "@/components/ui/Spinner";
import { useToast } from "@/hooks/useToast";

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();
  const { showToast } = useToast();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    // Check for query param error first (e.g. ?error=google_auth_failed)
    const paramError = searchParams.get("error");
    if (paramError) {
      showToast("Google sign-in failed. Please try again.", "error");
      router.replace("/login");
      return;
    }

    // Read token from fragment
    const hash = window.location.hash;
    if (hash && hash.includes("token=")) {
      const token = hash.replace("#token=", "");
      
      // Clear the fragment from the URL for security
      window.history.replaceState(null, "", window.location.pathname + window.location.search);
      
      // Store token using existing auth helper
      login(token);
      router.replace("/dashboard");
    } else {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setErrorMsg("Authentication failed: Missing token");
      showToast("Authentication failed", "error");
      setTimeout(() => router.replace("/login"), 1500);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]); // excluding login/router/showToast to prevent loops

  return (
    <>
      {errorMsg ? (
        <p className="text-code-orange text-sm mt-4">{errorMsg}</p>
      ) : (
        <>
          <Spinner size="lg" />
          <p className="text-cloudburst text-sm mt-4 text-center">
            Completing sign in...<br/>
            <span className="text-[10px] opacity-70">Securing your session</span>
          </p>
        </>
      )}
    </>
  );
}

export default function AuthCallback() {
  return (
    <div className="min-h-screen bg-inkwell flex flex-col items-center justify-center">
      <Suspense fallback={<Spinner size="lg" />}>
        <AuthCallbackContent />
      </Suspense>
    </div>
  );
}
