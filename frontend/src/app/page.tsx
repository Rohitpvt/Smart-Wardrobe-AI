"use client";

import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Camera, CloudRain, Sparkles, Shirt, ShieldCheck } from "lucide-react";

export default function LandingPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user && !loading) {
      router.push("/dashboard");
    }
  }, [user, loading, router]);

  if (loading) return null; // Or a very subtle loading state

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-inkwell relative overflow-hidden">
      {/* Background ambient light */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-cyber-cyan/5 rounded-full blur-[120px] pointer-events-none" />

      <main className="z-10 flex flex-col items-center max-w-5xl px-6 w-full text-center py-20">
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-porcelain mb-6">
          Midnight <span className="text-cyber-cyan">Fashion Intelligence</span>
        </h1>
        <p className="text-xl text-cloudburst max-w-2xl mb-12">
          An AI-powered digital wardrobe and personal stylist. Upload your clothing, get intelligent weather-aware recommendations, and organize your style perfectly.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 mb-24">
          <Link href="/login">
            <Button size="lg" variant="primary" className="w-full sm:w-auto">
              Login
            </Button>
          </Link>
          <Link href="/register">
            <Button size="lg" variant="outline" className="w-full sm:w-auto">
              Create Account
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
          <FeatureCard 
            icon={<Sparkles className="w-6 h-6 text-cyber-cyan" />}
            title="AI Clothing Analysis"
            description="Automatically extracts type, color, and patterns from your uploads using NVIDIA Vision AI."
          />
          <FeatureCard 
            icon={<CloudRain className="w-6 h-6 text-cyber-cyan" />}
            title="Weather-Based Styling"
            description="Outfit generation adapted to your current local temperatures and conditions."
          />
          <FeatureCard 
            icon={<Shirt className="w-6 h-6 text-cyber-cyan" />}
            title="Smart Wardrobe"
            description="Filter your wardrobe, track worn items, and view your usage analytics."
          />
          <FeatureCard 
            icon={<ShieldCheck className="w-6 h-6 text-cyber-cyan" />}
            title="Secure Private Uploads"
            description="Direct-to-S3 uploads utilizing temporary presigned URLs for maximum privacy."
          />
          <FeatureCard 
            icon={<Camera className="w-6 h-6 text-cyber-cyan" />}
            title="Outfit Recommendation"
            description="Generate perfect outfits for any occasion or style preference."
          />
        </div>
      </main>

      <footer className="mt-auto py-8 text-center text-cloudburst text-sm z-10 w-full border-t border-white/5">
        &copy; {new Date().getFullYear()} Smart Wardrobe AI. All rights reserved.
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="glass-card p-6 flex flex-col items-center text-center hover:bg-white/5 transition-colors">
      <div className="p-3 bg-white/5 rounded-xl mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-porcelain mb-2">{title}</h3>
      <p className="text-cloudburst text-sm">{description}</p>
    </div>
  );
}
