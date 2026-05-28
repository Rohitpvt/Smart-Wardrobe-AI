"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { api } from "@/lib/api";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";

export default function RegisterPage() {
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    password: "",
    confirm_password: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirm_password) {
      setError("Passwords do not match");
      return;
    }

    setIsLoading(true);
    try {
      await register(formData);
      // useAuth hook handles the redirect after successful registration/login
    } catch (err: any) {
      setError(err.message || "Failed to register. Please try again.");
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
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[radial-gradient(circle,rgba(82,225,254,0.03)_0%,transparent_70%)] pointer-events-none" />

      <Card variant="translucent" className="w-full max-w-md p-8 relative z-10">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-medium text-porcelain tracking-tight">Create Account</h2>
          <p className="text-sm text-cloudburst mt-2">Join Smart Wardrobe AI today</p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-[8px] bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[13px] font-medium text-cloudburst mb-1.5 uppercase tracking-wider">Full Name</label>
            <input
              type="text"
              name="full_name"
              required
              value={formData.full_name}
              onChange={handleChange}
              className="w-full bg-inkwell border border-starlight/10 rounded-[8px] px-4 py-2.5 text-porcelain text-sm focus:outline-none focus:border-cyber-cyan/50 focus:ring-1 focus:ring-cyber-cyan/50 transition-colors"
              placeholder="John Doe"
            />
          </div>
          <div>
            <label className="block text-[13px] font-medium text-cloudburst mb-1.5 uppercase tracking-wider">Email</label>
            <input
              type="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="w-full bg-inkwell border border-starlight/10 rounded-[8px] px-4 py-2.5 text-porcelain text-sm focus:outline-none focus:border-cyber-cyan/50 focus:ring-1 focus:ring-cyber-cyan/50 transition-colors"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="block text-[13px] font-medium text-cloudburst mb-1.5 uppercase tracking-wider">Password</label>
            <input
              type="password"
              name="password"
              required
              value={formData.password}
              onChange={handleChange}
              className="w-full bg-inkwell border border-starlight/10 rounded-[8px] px-4 py-2.5 text-porcelain text-sm focus:outline-none focus:border-cyber-cyan/50 focus:ring-1 focus:ring-cyber-cyan/50 transition-colors"
              placeholder="••••••••"
            />
          </div>
          <div>
            <label className="block text-[13px] font-medium text-cloudburst mb-1.5 uppercase tracking-wider">Confirm Password</label>
            <input
              type="password"
              name="confirm_password"
              required
              value={formData.confirm_password}
              onChange={handleChange}
              className="w-full bg-inkwell border border-starlight/10 rounded-[8px] px-4 py-2.5 text-porcelain text-sm focus:outline-none focus:border-cyber-cyan/50 focus:ring-1 focus:ring-cyber-cyan/50 transition-colors"
              placeholder="••••••••"
            />
          </div>
          <Button type="submit" variant="filled" className="w-full mt-2" disabled={isLoading}>
            {isLoading ? "Creating account..." : "Create Account"}
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
          Already have an account?{" "}
          <a href="/login" className="text-cyber-cyan hover:text-porcelain transition-colors">
            Login
          </a>
        </p>
      </Card>
    </div>
  );
}
