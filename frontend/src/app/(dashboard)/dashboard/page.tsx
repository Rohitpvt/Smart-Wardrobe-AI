"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import PageHeader from "@/components/ui/PageHeader";
import StatCard from "@/components/ui/StatCard";
import LoadingState from "@/components/ui/LoadingState";
import api from "@/lib/api";

export default function DashboardPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (isAuthenticated) {
      api.analytics.dashboard()
        .then((data) => {
          setAnalytics(data);
          setLoading(false);
        })
        .catch((err) => {
          console.error(err);
          setError("Failed to load dashboard analytics.");
          setLoading(false);
        });
    }
  }, [isAuthenticated]);

  if (authLoading || !isAuthenticated) return null;

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-10">
      
      <PageHeader 
        title="Dashboard" 
        description={`Welcome back, ${user?.full_name}`}
        badge={{ text: "Pro", variant: "cyan" }}
        actions={
          <>
            <Button variant="ghost" className="border border-starlight/20" onClick={() => router.push("/outfit-ai")}>
              Generate Outfit
            </Button>
            <Button variant="filled" onClick={() => router.push("/upload")}>
              Upload Cloth
            </Button>
          </>
        }
      />

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-sm">
          {error}
        </div>
      )}

      {loading && !error && <LoadingState message="Analyzing wardrobe data..." />}

      {!loading && analytics && (
        <div className="space-y-8 animate-fade-in-up">
          
          {/* Quick Actions & Insight */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card 
              variant="translucent" 
              className="p-6 border border-cyber-cyan/20 cursor-pointer hover:border-cyber-cyan/50 transition-all duration-300 md:col-span-2 relative overflow-hidden group" 
              onClick={() => router.push("/weather-style")}
            >
              <div className="absolute top-0 right-0 w-48 h-48 bg-glow-cyan opacity-20 group-hover:opacity-40 transition-opacity pointer-events-none rounded-full blur-3xl -mr-10 -mt-10" />
              <div className="flex items-center justify-between relative z-10">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-2 h-2 rounded-full bg-cyber-cyan animate-pulse" />
                    <span className="text-[10px] uppercase tracking-widest text-cyber-cyan font-[family-name:var(--font-mono)]">AI Insight</span>
                  </div>
                  <h2 className="text-xl md:text-2xl font-medium text-porcelain tracking-tight">What should I wear today?</h2>
                  <p className="text-sm text-cloudburst mt-1">Get weather-based outfit suggestions.</p>
                </div>
                <div className="text-5xl md:text-6xl drop-shadow-lg">☀️</div>
              </div>
            </Card>
            
            <div className="grid grid-cols-2 gap-4">
              <Card variant="basic" hover className="p-4 flex flex-col items-center justify-center text-center cursor-pointer" onClick={() => router.push("/wardrobe")}>
                <span className="text-xl mb-1 text-cyber-cyan">✦</span>
                <p className="text-sm text-porcelain mb-0.5">Wardrobe</p>
                <p className="text-[10px] text-cloudburst uppercase tracking-wider font-[family-name:var(--font-mono)]">View All</p>
              </Card>
              <Card variant="basic" hover className="p-4 flex flex-col items-center justify-center text-center cursor-pointer" onClick={() => router.push("/outfits/saved")}>
                <span className="text-xl mb-1 text-code-orange">★</span>
                <p className="text-sm text-porcelain mb-0.5">Saved</p>
                <p className="text-[10px] text-cloudburst uppercase tracking-wider font-[family-name:var(--font-mono)]">Outfits</p>
              </Card>
            </div>
          </div>

          {/* Premium Analytics Grid */}
          <div>
            <h3 className="text-porcelain font-medium mb-4 flex items-center gap-2">
              <span className="text-cyber-cyan text-sm">⊞</span> Overview
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard label="Total Clothes" value={analytics.total_clothes} badgeVariant="cyan" />
              <StatCard 
                label="Combinations" 
                value={analytics.possible_outfit_combinations_estimate > 0 ? analytics.possible_outfit_combinations_estimate : "0"} 
                badgeVariant="cyan" 
              />
              <StatCard label="Saved Outfits" value={analytics.saved_outfits_count} badgeVariant="orange" />
              <StatCard label="Worn Outfits" value={analytics.outfit_history_count} badgeVariant="success" />
              
              <StatCard label="Most Used Category" value={analytics.most_used_category || "N/A"} badgeVariant="default" />
              <StatCard label="Most Common Color" value={analytics.most_common_color || "N/A"} badgeVariant="default" />
              
              <StatCard 
                label="Rarely Used" 
                value={analytics.rarely_used_count + analytics.never_used_count} 
                badgeVariant="warning" 
                className="border-yellow-500/20"
              />
              <StatCard 
                label="Needs Attention" 
                value={analytics.needs_repair_count + analytics.needs_washing_count} 
                badgeVariant="warning" 
                className="border-red-500/20"
              />
            </div>
          </div>

          {/* Breakdowns */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card variant="basic" className="p-6">
              <h3 className="text-porcelain font-medium mb-5">Top Categories</h3>
              {analytics.wardrobe_breakdown_by_category.length > 0 ? (
                <div className="space-y-3">
                  {analytics.wardrobe_breakdown_by_category.slice(0, 5).map((cat: any) => (
                    <div key={cat.category} className="flex justify-between items-center text-sm">
                      <span className="text-cloudburst">{cat.category}</span>
                      <span className="text-porcelain bg-carbon px-2 py-1 rounded border border-starlight/10 font-[family-name:var(--font-mono)] text-xs">{cat.count}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-cloudburst">No category data yet.</p>
              )}
            </Card>

            <Card variant="basic" className="p-6">
              <h3 className="text-porcelain font-medium mb-5">Wardrobe Roles</h3>
              <div className="space-y-3 text-sm">
                {[
                  { label: "Top Wear", count: analytics.top_wear_count },
                  { label: "Bottom Wear", count: analytics.bottom_wear_count },
                  { label: "Footwear", count: analytics.footwear_count },
                  { label: "Accessories", count: analytics.accessory_count }
                ].map((item) => (
                  <div key={item.label} className="flex justify-between items-center">
                    <span className="text-cloudburst">{item.label}</span>
                    <span className="text-porcelain bg-carbon px-2 py-1 rounded border border-starlight/10 font-[family-name:var(--font-mono)] text-xs">{item.count}</span>
                  </div>
                ))}
              </div>
            </Card>
            
            <Card variant="basic" className="p-6">
              <h3 className="text-porcelain font-medium mb-5">Seasons</h3>
              <div className="space-y-3 text-sm">
                {[
                  { label: "Summer", count: analytics.summer_clothes_count },
                  { label: "Winter", count: analytics.winter_clothes_count },
                  { label: "Monsoon", count: analytics.monsoon_clothes_count },
                  { label: "All Season", count: analytics.all_season_clothes_count }
                ].map((item) => (
                  <div key={item.label} className="flex justify-between items-center">
                    <span className="text-cloudburst">{item.label}</span>
                    <span className="text-porcelain bg-carbon px-2 py-1 rounded border border-starlight/10 font-[family-name:var(--font-mono)] text-xs">{item.count}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
