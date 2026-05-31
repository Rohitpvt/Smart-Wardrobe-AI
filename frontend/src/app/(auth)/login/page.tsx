"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/useToast";
import api from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const { showToast } = useToast();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setIsLoading(true);
    try {
      const res = await api.post("/auth/login", {
        email: email,
        password: password
      });
      
      login(res.data.access_token);
      showToast("Logged in successfully", "success");
      router.push("/dashboard");
    } catch (error: any) {
      showToast(error.response?.data?.detail || "Invalid credentials", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-inkwell relative">
      <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] bg-cyber-cyan/[0.03] rounded-full blur-[120px] pointer-events-none" />
      
      {/* Brand */}
      <Link href="/" className="text-xl font-bold tracking-tight text-porcelain mb-8 z-10">
        Smart <span className="text-cyber-cyan">Wardrobe</span>
      </Link>

      <Card className="w-full max-w-sm z-10">
        <CardContent className="p-8">
          <div className="text-center mb-8">
            <h1 className="text-xl font-bold text-porcelain mb-1">Welcome back</h1>
            <p className="text-sm text-cloudburst">Sign in to your account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              placeholder="name@example.com"
            />
            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              placeholder="••••••••"
            />
            <Button type="submit" className="w-full" isLoading={isLoading}>
              Sign In
            </Button>
          </form>
          
          <p className="mt-8 text-center text-sm text-cloudburst">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="text-cyber-cyan hover:text-cyber-cyan/80 font-medium transition-colors">
              Create one
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
