"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
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
      // 1. Register User
      await api.post("/auth/register", formData);
      
      // 2. Auto Login
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
    <div className="min-h-screen flex items-center justify-center p-4 bg-inkwell relative">
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-cyber-cyan/5 rounded-full blur-[100px] pointer-events-none" />
      
      <Card className="w-full max-w-md z-10">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Create Account</CardTitle>
          <p className="text-cloudburst text-sm mt-2">Start organizing your digital wardrobe</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              id="full_name"
              label="Full Name"
              type="text"
              value={formData.full_name}
              onChange={handleChange}
              required
            />
            <Input
              id="email"
              label="Email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
            <Input
              id="password"
              label="Password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              required
              minLength={8}
            />
            <Input
              id="confirm_password"
              label="Confirm Password"
              type="password"
              value={formData.confirm_password}
              onChange={handleChange}
              required
            />
            <Button type="submit" className="w-full" isLoading={isLoading}>
              Register
            </Button>
          </form>
          
          <div className="mt-6 text-center text-sm text-cloudburst">
            Already have an account?{" "}
            <Link href="/login" className="text-cyber-cyan hover:underline">
              Sign in here
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
