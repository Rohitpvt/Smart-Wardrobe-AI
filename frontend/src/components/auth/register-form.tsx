"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import Link from "next/link";
import { m } from "framer-motion";
import { Eye, EyeOff, Loader2, Shield, Sparkles, Lock } from "lucide-react";
import { api } from "@/lib/axios";
import axios from "axios";

export function RegisterForm() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    city: "",
    country_code: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const registerMutation = useMutation({
    mutationFn: async () => {
      const response = await api.post("/auth/register", formData);
      return response.data;
    },
    onSuccess: () => {
      setSuccessMsg("Account created successfully. Redirecting to login...");
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    },
    onError: (error: unknown) => {
      if (axios.isAxiosError(error) && error.response) {
        const status = error.response.status;
        const detail = error.response.data?.detail || error.response.data?.error;
        if (status === 400) {
          setErrorMsg(detail || "Registration failed.");
        } else if (status === 429) {
          setErrorMsg(detail || "Too many attempts. Please try again later.");
        } else if (status === 422) {
          if (Array.isArray(detail)) {
            setErrorMsg(detail.map((err: { msg: string }) => err.msg).join(", "));
          } else {
            setErrorMsg("Please fill out all required fields correctly.");
          }
        } else {
          setErrorMsg(detail || "An unexpected error occurred.");
        }
      } else {
        setErrorMsg("Network error. Please ensure the server is running.");
      }
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    registerMutation.mutate();
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
          Create your account
        </h1>
        <p className="text-text-secondary">
          Start organizing your wardrobe with AI.
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

      {/* Success message */}
      {successMsg && (
        <m.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-sm flex items-start gap-3"
        >
          <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center mt-0.5 shrink-0">
            <span className="text-xs">✓</span>
          </div>
          <span>{successMsg}</span>
        </m.div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Name Fields */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="reg-first-name" className="block text-sm font-medium text-text-secondary">
              First name
            </label>
            <input
              id="reg-first-name"
              type="text"
              name="first_name"
              value={formData.first_name}
              onChange={handleChange}
              required
              autoComplete="given-name"
              placeholder="Jane"
              className="ds-input py-3 rounded-xl border-border-subtle focus:border-brand-blue"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="reg-last-name" className="block text-sm font-medium text-text-secondary">
              Last name
            </label>
            <input
              id="reg-last-name"
              type="text"
              name="last_name"
              value={formData.last_name}
              onChange={handleChange}
              required
              autoComplete="family-name"
              placeholder="Doe"
              className="ds-input py-3 rounded-xl border-border-subtle focus:border-brand-blue"
            />
          </div>
        </div>

        {/* Email */}
        <div className="space-y-2">
          <label htmlFor="reg-email" className="block text-sm font-medium text-text-secondary">
            Email address
          </label>
          <input
            id="reg-email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            autoComplete="email"
            placeholder="you@example.com"
            className="ds-input py-3 rounded-xl border-border-subtle focus:border-brand-blue"
          />
        </div>

        {/* Location Fields */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="reg-city" className="block text-sm font-medium text-text-secondary">
              City <span className="text-text-tertiary">(optional)</span>
            </label>
            <input
              id="reg-city"
              type="text"
              name="city"
              value={formData.city}
              onChange={handleChange}
              autoComplete="address-level2"
              placeholder="New Delhi"
              className="ds-input py-3 rounded-xl border-border-subtle focus:border-brand-blue"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="reg-country" className="block text-sm font-medium text-text-secondary">
              Country <span className="text-text-tertiary">(optional)</span>
            </label>
            <input
              id="reg-country"
              type="text"
              name="country_code"
              value={formData.country_code}
              onChange={handleChange}
              maxLength={2}
              autoComplete="country"
              placeholder="IN"
              className="ds-input py-3 rounded-xl border-border-subtle focus:border-brand-blue"
            />
          </div>
        </div>

        {/* Password */}
        <div className="space-y-2">
          <label htmlFor="reg-password" className="block text-sm font-medium text-text-secondary">
            Password
          </label>
          <div className="relative">
            <input
              id="reg-password"
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              minLength={8}
              autoComplete="new-password"
              placeholder="Minimum 8 characters"
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
          disabled={registerMutation.isPending || !!successMsg}
          className="ds-btn-primary w-full py-3.5 text-base rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {registerMutation.isPending ? (
            <span className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              Creating account…
            </span>
          ) : (
            "Create Account"
          )}
        </button>
      </form>

      {/* Divider */}
      <div className="my-8 flex items-center gap-4">
        <div className="flex-1 h-px bg-border-subtle" />
        <span className="text-text-tertiary text-xs font-medium uppercase tracking-wider">or</span>
        <div className="flex-1 h-px bg-border-subtle" />
      </div>

      {/* Login link */}
      <p className="text-center text-sm text-text-secondary">
        Already have an account?{" "}
        <Link href="/login" className="text-brand-blue hover:text-blue-400 font-semibold transition-colors">
          Sign in
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
