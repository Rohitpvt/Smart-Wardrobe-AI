"use client";

import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Camera, CloudRain, Sparkles, Shirt, ShieldCheck, ArrowRight } from "lucide-react";

export default function LandingPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user && !loading) {
      router.push("/dashboard");
    }
  }, [user, loading, router]);

  if (loading) return null;

  return (
    <div className="min-h-screen flex flex-col bg-inkwell relative overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-cyber-cyan/[0.03] rounded-full blur-[120px] pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-6 md:px-12 h-16">
        <span className="text-lg font-bold tracking-tight text-porcelain">
          Smart <span className="text-cyber-cyan">Wardrobe</span>
        </span>
        <div className="flex items-center gap-3">
          <Link href="/login">
            <Button variant="ghost" size="sm">Sign In</Button>
          </Link>
          <Link href="/register">
            <Button size="sm">Get Started</Button>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <main className="z-10 flex-1 flex flex-col items-center justify-center max-w-4xl mx-auto px-6 w-full text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-border-default bg-surface-raised text-sm text-cloudburst mb-8">
          <Sparkles className="h-3.5 w-3.5 text-cyber-cyan" />
          AI-Powered Fashion Intelligence
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-porcelain mb-6 leading-[1.1]">
          Your wardrobe,{" "}
          <span className="text-cyber-cyan">intelligently</span>{" "}
          organized
        </h1>

        <p className="text-lg text-cloudburst max-w-xl mb-10 leading-relaxed">
          Upload your clothing, get AI-powered analysis, and receive weather-aware outfit recommendations — all in one place.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 mb-24">
          <Link href="/register">
            <Button size="lg" variant="primary" className="w-full sm:w-auto gap-2">
              Get Started Free <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link href="/login">
            <Button size="lg" variant="outline" className="w-full sm:w-auto">
              Sign In
            </Button>
          </Link>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full max-w-3xl">
          <FeatureCard 
            icon={<Sparkles className="w-5 h-5 text-cyber-cyan" />}
            title="AI Vision Analysis"
            description="NVIDIA-powered clothing detection extracts type, color, and patterns automatically."
          />
          <FeatureCard 
            icon={<CloudRain className="w-5 h-5 text-cyber-cyan" />}
            title="Weather Styling"
            description="Real-time outfit suggestions based on your local weather conditions."
          />
          <FeatureCard 
            icon={<Shirt className="w-5 h-5 text-cyber-cyan" />}
            title="Smart Wardrobe"
            description="Filter, track, and analyze your digital clothing collection."
          />
          <FeatureCard 
            icon={<ShieldCheck className="w-5 h-5 text-cyber-cyan" />}
            title="Private & Secure"
            description="Direct-to-S3 uploads with presigned URLs for maximum privacy."
          />
          <FeatureCard 
            icon={<Camera className="w-5 h-5 text-cyber-cyan" />}
            title="Outfit Builder"
            description="AI assembles complete outfits from your wardrobe items."
          />
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-8 text-center text-cloudburst/60 text-xs">
        &copy; {new Date().getFullYear()} Smart Wardrobe AI
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="glass-card p-5 text-left hover:bg-white/[0.03] transition-all duration-300 hover:-translate-y-0.5">
      <div className="p-2.5 bg-white/5 rounded-xl w-fit mb-3 border border-border-subtle">
        {icon}
      </div>
      <h3 className="text-sm font-semibold text-porcelain mb-1.5">{title}</h3>
      <p className="text-cloudburst text-xs leading-relaxed">{description}</p>
    </div>
  );
}
