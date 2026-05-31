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

export default function RegisterPage() {
  const router = useRouter();
  const { login } = useAuth();
  const { showToast } = useToast();
  
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    password: "",
    confirm_password: ""
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.id]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirm_password) {
      showToast("Passwords do not match", "error");
      return;
    }

    setIsLoading(true);
    try {
      await api.post("/auth/register", formData);
      const res = await api.post("/auth/login", {
        email: formData.email,
        password: formData.password
      });
      
      login(res.data.access_token);
      showToast("Account created successfully", "success");
      router.push("/dashboard");
    } catch (error: any) {
      showToast(error.response?.data?.detail || "Registration failed", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-inkwell relative">
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-cyber-cyan/[0.03] rounded-full blur-[120px] pointer-events-none" />
      
      {/* Brand */}
      <Link href="/" className="text-xl font-bold tracking-tight text-porcelain mb-8 z-10">
        Smart <span className="text-cyber-cyan">Wardrobe</span>
      </Link>

      <Card className="w-full max-w-sm z-10">
        <CardContent className="p-8">
          <div className="text-center mb-8">
            <h1 className="text-xl font-bold text-porcelain mb-1">Create account</h1>
            <p className="text-sm text-cloudburst">Start organizing your digital wardrobe</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              id="full_name"
              label="Full Name"
              type="text"
              value={formData.full_name}
              onChange={handleChange}
              required
              placeholder="John Doe"
            />
            <Input
              id="email"
              label="Email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="name@example.com"
            />
            <Input
              id="password"
              label="Password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              required
              minLength={8}
              placeholder="Min. 8 characters"
            />
            <Input
              id="confirm_password"
              label="Confirm Password"
              type="password"
              value={formData.confirm_password}
              onChange={handleChange}
              required
              placeholder="••••••••"
            />
            <Button type="submit" className="w-full" isLoading={isLoading}>
              Create Account
            </Button>
          </form>
          
          <p className="mt-8 text-center text-sm text-cloudburst">
            Already have an account?{" "}
            <Link href="/login" className="text-cyber-cyan hover:text-cyber-cyan/80 font-medium transition-colors">
              Sign in
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
