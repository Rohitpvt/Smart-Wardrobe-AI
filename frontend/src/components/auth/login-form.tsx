"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import Link from "next/link";
import { m } from "framer-motion";
import { Eye, EyeOff, Loader2, Shield, Sparkles, Lock } from "lucide-react";
import axios from "axios";
import { api } from "@/lib/axios";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
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
          <span>{errorMsg}</span>
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
      <div className="my-8 flex items-center gap-4">
        <div className="flex-1 h-px bg-border-subtle" />
        <span className="text-text-tertiary text-xs font-medium uppercase tracking-wider">or</span>
        <div className="flex-1 h-px bg-border-subtle" />
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
