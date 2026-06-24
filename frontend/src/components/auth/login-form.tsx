"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import Link from "next/link";
import { m } from "framer-motion";
import { Eye, EyeOff, Loader2, Shield, Sparkles, Lock } from "lucide-react";
import axios from "axios";
import { api } from "@/lib/axios";
import { GoogleLogin } from '@react-oauth/google';

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [infoMsg, setInfoMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [debugData, setDebugData] = useState<any>(null);

  const loginMutation = useMutation({
    mutationFn: async () => {
      const response = await api.post("/auth/login", { email, password });
      return response.data;
    },
    onSuccess: () => {
      // We no longer need to manually set the token, the backend sets an HttpOnly cookie
      router.push("/dashboard");
    },
    onError: (error: unknown) => {
      if (axios.isAxiosError(error) && error.response) {
        const status = error.response.status;
        const detail = error.response.data?.detail || error.response.data?.error;
        if (status === 401) {
          setErrorMsg(detail || "Invalid email or password");
        } else if (status === 429) {
          setErrorMsg(detail || "Too many attempts. Please try again later.");
        } else if (status === 422) {
          setErrorMsg("Please fill out all fields correctly.");
        } else {
          setErrorMsg(detail || "An unexpected error occurred.");
        }
      } else {
        setErrorMsg("Network error. Please ensure the server is running.");
      }
    },
  });

  const googleLoginMutation = useMutation({
    mutationFn: async (credential: string) => {
      const response = await api.post("/auth/google/login", { credential });
      return response.data;
    },
    onSuccess: (data) => {
      if (data.status === "registration_required") {
        router.push(data.redirect_to || "/register");
      } else if (data.status === "login_success") {
        router.push(data.redirect_to || "/dashboard");
      }
    },
    onError: (error: unknown) => {
      setDebugData(null);
      if (axios.isAxiosError(error) && error.response) {
        // Extract debug info if present
        if (error.response.data?.debug) {
          console.table(error.response.data.debug);
          setDebugData(error.response.data.debug);
        }
        setErrorMsg(error.response.data?.detail?.message || error.response.data?.detail || "Google login failed.");
      } else {
        setErrorMsg("Network error during Google login.");
      }
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setInfoMsg("");
    loginMutation.mutate();
  };

  return (
    <m.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text-primary tracking-tight mb-2">
          Welcome back
        </h1>
        <p className="text-text-secondary">
          Sign in to your account to continue.
        </p>
      </div>

      {/* Error message */}
      {errorMsg && (
        <m.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm flex items-start gap-3"
        >
          <div className="w-5 h-5 rounded-full bg-red-500/20 flex items-center justify-center mt-0.5 shrink-0">
            <span className="text-xs">!</span>
          </div>
          <div className="flex flex-col">
            <span>{errorMsg}</span>
            {debugData && (
              <div className="mt-3 p-3 bg-black/40 rounded border border-red-500/20 text-xs font-mono text-red-200/80 relative">
                <div className="font-bold text-red-300 mb-1 flex justify-between items-center">
                  <span>Google OAuth Debug</span>
                  <button 
                    type="button"
                    onClick={() => navigator.clipboard.writeText(JSON.stringify(debugData, null, 2))}
                    className="bg-red-500/20 hover:bg-red-500/30 text-red-300 px-2 py-1 rounded text-[10px] uppercase font-bold tracking-wider transition-colors"
                  >
                    Copy Debug JSON
                  </button>
                </div>
                <div>Exception: {debugData.exception_message}</div>
                <div>Type: {debugData.exception_type}</div>
                <div>Audience Match: {String(debugData.aud_matches_backend)}</div>
                <div>Issuer: {debugData.token_iss}</div>
                <div>Segments: {debugData.token_segments}</div>
                <div className="mt-1 truncate opacity-75">Client: {debugData.backend_google_client_id}</div>
                <div className="mt-3 pt-2 border-t border-red-500/20 text-[10px] text-red-300/60 leading-tight">
                  The latest Google OAuth debug error has also been saved to artifacts/GOOGLE_LATEST_TOKEN_ERROR.json
                </div>
              </div>
            )}
          </div>
        </m.div>
      )}

      {/* Info message (account not found) */}
      {infoMsg && (
        <m.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl text-blue-400 text-sm flex items-start gap-3"
        >
          <div className="w-5 h-5 rounded-full bg-blue-500/20 flex items-center justify-center mt-0.5 shrink-0">
            <span className="text-xs">i</span>
          </div>
          <div>
            <span>{infoMsg}</span>
            <div className="mt-2">
              <Link href="/register" className="text-brand-blue hover:text-blue-400 font-semibold transition-colors underline">
                Create account →
              </Link>
            </div>
          </div>
        </m.div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Email Field */}
        <div className="space-y-2">
          <label htmlFor="login-email" className="block text-sm font-medium text-text-secondary">
            Email address
          </label>
          <input
            id="login-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            placeholder="you@example.com"
            className="ds-input py-3 rounded-xl border-border-subtle focus:border-brand-blue"
          />
        </div>

        {/* Password Field */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label htmlFor="login-password" className="block text-sm font-medium text-text-secondary">
              Password
            </label>
          </div>
          <div className="relative">
            <input
              id="login-password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              placeholder="Enter your password"
              className="ds-input py-3 rounded-xl border-border-subtle focus:border-brand-blue pr-11"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-secondary transition-colors p-1"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loginMutation.isPending}
          className="ds-btn-primary w-full py-3.5 text-base rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loginMutation.isPending ? (
            <span className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              Signing in…
            </span>
          ) : (
            "Sign In"
          )}
        </button>
      </form>

      {/* Divider */}
      <div className="my-6 flex items-center gap-4">
        <div className="flex-1 h-px bg-border-subtle" />
        <span className="text-text-tertiary text-xs font-medium uppercase tracking-wider">or continue with</span>
        <div className="flex-1 h-px bg-border-subtle" />
      </div>

      <div className="flex justify-center mb-8">
        <GoogleLogin
          onSuccess={credentialResponse => {
            console.log("Google credential exists:", !!credentialResponse.credential);
            console.log("Google credential length:", credentialResponse.credential?.length);
            console.log("Google credential segments:", credentialResponse.credential?.split(".").length);

            if (!credentialResponse.credential) {
              setErrorMsg("Google did not return a valid credential. Please try again.");
              return;
            }
            
            googleLoginMutation.mutate(credentialResponse.credential);
          }}
          onError={() => {
            setErrorMsg("Google login was unsuccessful");
          }}
          theme="filled_black"
          shape="pill"
        />
      </div>

      {/* Register link */}
      <p className="text-center text-sm text-text-secondary">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="text-brand-blue hover:text-blue-400 font-semibold transition-colors">
          Create account
        </Link>
      </p>

      {/* Trust badges */}
      <div className="mt-8 flex items-center justify-center gap-4 flex-wrap">
        <div className="flex items-center gap-1.5 text-text-tertiary text-xs">
          <Shield className="w-3.5 h-3.5" />
          <span>Secure Auth</span>
        </div>
        <div className="w-px h-3 bg-border-subtle" />
        <div className="flex items-center gap-1.5 text-text-tertiary text-xs">
          <Sparkles className="w-3.5 h-3.5" />
          <span>AI Powered</span>
        </div>
        <div className="w-px h-3 bg-border-subtle" />
        <div className="flex items-center gap-1.5 text-text-tertiary text-xs">
          <Lock className="w-3.5 h-3.5" />
          <span>Privacy First</span>
        </div>
      </div>
    </m.div>
  );
}
