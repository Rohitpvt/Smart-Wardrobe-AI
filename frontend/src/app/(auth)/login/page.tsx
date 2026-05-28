"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { api } from "@/lib/api";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await login({ email, password });
      // useAuth hook handles the redirect
    } catch (err: any) {
      setError(err.message || "Failed to login. Please check your credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const { url } = await api.auth.googleUrl();
      if (url) {
        window.location.href = url;
      }
    } catch (err: any) {
      setError("Google login is not configured yet.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[radial-gradient(circle,rgba(82,225,254,0.03)_0%,transparent_70%)] pointer-events-none" />

      <Card variant="translucent" className="w-full max-w-md p-8 relative z-10">
        <div className="text-center mb-8">
          <div className="w-10 h-10 mx-auto rounded-[8px] bg-carbon flex items-center justify-center shadow-[inset_0_0_0_1px_rgba(82,225,254,0.2)] mb-4">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-cyber-cyan">
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
          </div>
          <h2 className="text-2xl font-medium text-porcelain tracking-tight">Welcome back</h2>
          <p className="text-sm text-cloudburst mt-2">Enter your credentials to access your wardrobe</p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-[8px] bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-[13px] font-medium text-cloudburst mb-1.5 uppercase tracking-wider">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-inkwell border border-starlight/10 rounded-[8px] px-4 py-2.5 text-porcelain text-sm focus:outline-none focus:border-cyber-cyan/50 focus:ring-1 focus:ring-cyber-cyan/50 transition-colors"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="block text-[13px] font-medium text-cloudburst mb-1.5 uppercase tracking-wider">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-inkwell border border-starlight/10 rounded-[8px] px-4 py-2.5 text-porcelain text-sm focus:outline-none focus:border-cyber-cyan/50 focus:ring-1 focus:ring-cyber-cyan/50 transition-colors"
              placeholder="••••••••"
            />
          </div>
          <Button type="submit" variant="filled" className="w-full" disabled={isLoading}>
            {isLoading ? "Signing in..." : "Login"}
          </Button>
        </form>

        <div className="mt-6 flex items-center justify-between">
          <div className="border-t border-starlight/10 flex-grow" />
          <span className="px-3 text-xs text-muted uppercase tracking-widest font-[family-name:var(--font-mono)]">OR</span>
          <div className="border-t border-starlight/10 flex-grow" />
        </div>

        <div className="mt-6">
          <button
            onClick={handleGoogleLogin}
            type="button"
            className="w-full flex items-center justify-center gap-3 bg-carbon border border-starlight/10 hover:border-starlight/20 text-porcelain rounded-[12px] px-4 py-2.5 text-sm font-medium transition-colors"
          >
            <svg viewBox="0 0 24 24" width="18" height="18" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>
        </div>

        <p className="mt-8 text-center text-sm text-cloudburst">
          Don't have an account?{" "}
          <a href="/register" className="text-cyber-cyan hover:text-porcelain transition-colors">
            Create Account
          </a>
        </p>
      </Card>
    </div>
  );
}
