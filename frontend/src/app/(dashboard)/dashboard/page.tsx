"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import api from "@/lib/api";

export default function DashboardPage() {
  const { user, isAuthenticated, isLoading: authLoading, logout } = useAuth();
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

  if (authLoading || !isAuthenticated) {
    return <div className="min-h-screen flex items-center justify-center text-cloudburst">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-charcoal p-8 pb-20">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-medium text-porcelain">Dashboard</h1>
            <p className="text-cloudburst mt-1">Welcome back, {user?.full_name}</p>
          </div>
          <div className="flex gap-4">
            <Button variant="ghost" onClick={logout}>Logout</Button>
            <Button variant="filled" onClick={() => router.push("/upload")}>Upload Cloth</Button>
            <Button variant="ghost" className="border border-cyber-cyan text-cyber-cyan" onClick={() => router.push("/outfit-ai")}>Generate Outfit</Button>
          </div>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl">
            {error}
          </div>
        )}

        {loading && !error && (
          <div className="text-center py-10 text-cloudburst animate-pulse">Loading analytics...</div>
        )}

        {!loading && analytics && (
          <>
            {/* Quick Actions & Insight */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card variant="translucent" className="p-6 border border-cyber-cyan/10 cursor-pointer hover:border-cyber-cyan/30 transition-all duration-200" onClick={() => router.push("/weather-style")}>
                <div className="flex items-center justify-between">
                  <div>
                    <Badge variant="cyan" className="mb-2">AI Insight</Badge>
                    <h2 className="text-xl font-medium text-porcelain">What should I wear today?</h2>
                    <p className="text-sm text-cloudburst mt-1">Weather-based outfit suggestions.</p>
                  </div>
                  <div className="text-4xl">☀️</div>
                </div>
              </Card>
              
              <div className="grid grid-cols-2 gap-4">
                <Card variant="basic" className="p-4 cursor-pointer hover:bg-charcoal transition-colors flex flex-col items-center justify-center text-center" onClick={() => router.push("/wardrobe")}>
                  <p className="text-sm text-porcelain mb-1">View Wardrobe</p>
                  <p className="text-xs text-cloudburst">Manage your items</p>
                </Card>
                <Card variant="basic" className="p-4 cursor-pointer hover:bg-charcoal transition-colors flex flex-col items-center justify-center text-center" onClick={() => router.push("/outfits/saved")}>
                  <p className="text-sm text-porcelain mb-1">Saved Outfits</p>
                  <p className="text-xs text-cloudburst">Your favorite combos</p>
                </Card>
                <Card variant="basic" className="p-4 cursor-pointer hover:bg-charcoal transition-colors flex flex-col items-center justify-center text-center" onClick={() => router.push("/outfits/history")}>
                  <p className="text-sm text-porcelain mb-1">Outfit History</p>
                  <p className="text-xs text-cloudburst">Previously worn</p>
                </Card>
                <Card variant="basic" className="p-4 cursor-pointer hover:bg-charcoal transition-colors flex flex-col items-center justify-center text-center" onClick={() => router.push("/profile")}>
                  <p className="text-sm text-porcelain mb-1">Style Profile</p>
                  <p className="text-xs text-cloudburst">Preferences</p>
                </Card>
              </div>
            </div>

            {/* Premium Analytics Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card variant="translucent" className="p-5 flex flex-col justify-between h-32">
                <Badge variant="cyan" className="self-start">Total Clothes</Badge>
                <div className="mt-auto">
                  <p className="text-3xl font-medium text-porcelain">{analytics.total_clothes}</p>
                </div>
              </Card>

              <Card variant="translucent" className="p-5 flex flex-col justify-between h-32">
                <Badge variant="cyan" className="self-start">Possible Outfits</Badge>
                <div className="mt-auto">
                  <p className="text-3xl font-medium text-porcelain">
                    {analytics.possible_outfit_combinations_estimate > 0 
                      ? analytics.possible_outfit_combinations_estimate 
                      : "0"}
                  </p>
                </div>
              </Card>

              <Card variant="translucent" className="p-5 flex flex-col justify-between h-32">
                <Badge variant="orange" className="self-start">Saved Outfits</Badge>
                <div className="mt-auto">
                  <p className="text-3xl font-medium text-porcelain">{analytics.saved_outfits_count}</p>
                </div>
              </Card>

              <Card variant="translucent" className="p-5 flex flex-col justify-between h-32">
                <Badge variant="success" className="self-start">Worn Outfits</Badge>
                <div className="mt-auto">
                  <p className="text-3xl font-medium text-porcelain">{analytics.outfit_history_count}</p>
                </div>
              </Card>

              <Card variant="translucent" className="p-5 flex flex-col justify-between h-32">
                <Badge variant="default" className="self-start">Most Used Category</Badge>
                <div className="mt-auto">
                  <p className="text-xl font-medium text-porcelain truncate">{analytics.most_used_category || "N/A"}</p>
                </div>
              </Card>

              <Card variant="translucent" className="p-5 flex flex-col justify-between h-32">
                <Badge variant="default" className="self-start">Most Common Color</Badge>
                <div className="mt-auto">
                  <p className="text-xl font-medium text-porcelain truncate">{analytics.most_common_color || "N/A"}</p>
                </div>
              </Card>

              <Card variant="translucent" className="p-5 flex flex-col justify-between h-32 border-yellow-500/20">
                <Badge variant="warning" className="self-start">Rarely Used</Badge>
                <div className="mt-auto">
                  <p className="text-3xl font-medium text-porcelain">{analytics.rarely_used_count + analytics.never_used_count}</p>
                </div>
              </Card>

              <Card variant="translucent" className="p-5 flex flex-col justify-between h-32 border-red-500/20">
                <Badge variant="warning" className="self-start text-red-400 border-red-500/30">Needs Repair/Wash</Badge>
                <div className="mt-auto">
                  <p className="text-3xl font-medium text-porcelain">{analytics.needs_repair_count + analytics.needs_washing_count}</p>
                </div>
              </Card>
            </div>

            {/* Breakdowns */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Category Breakdown */}
              <Card variant="basic" className="p-6">
                <h3 className="text-porcelain font-medium mb-4">Top Categories</h3>
                {analytics.wardrobe_breakdown_by_category.length > 0 ? (
                  <div className="space-y-3">
                    {analytics.wardrobe_breakdown_by_category.map((cat: any) => (
                      <div key={cat.category} className="flex justify-between items-center text-sm">
                        <span className="text-cloudburst">{cat.category}</span>
                        <span className="text-porcelain bg-carbon px-2 py-1 rounded-md border border-starlight/10">{cat.count}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-cloudburst">No category data yet.</p>
                )}
              </Card>

              {/* Roles Breakdown */}
              <Card variant="basic" className="p-6">
                <h3 className="text-porcelain font-medium mb-4">Wardrobe Roles</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-cloudburst">Top Wear</span>
                    <span className="text-porcelain bg-carbon px-2 py-1 rounded-md border border-starlight/10">{analytics.top_wear_count}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-cloudburst">Bottom Wear</span>
                    <span className="text-porcelain bg-carbon px-2 py-1 rounded-md border border-starlight/10">{analytics.bottom_wear_count}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-cloudburst">Footwear</span>
                    <span className="text-porcelain bg-carbon px-2 py-1 rounded-md border border-starlight/10">{analytics.footwear_count}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-cloudburst">Accessories</span>
                    <span className="text-porcelain bg-carbon px-2 py-1 rounded-md border border-starlight/10">{analytics.accessory_count}</span>
                  </div>
                </div>
              </Card>
              
              {/* Season Breakdown */}
              <Card variant="basic" className="p-6">
                <h3 className="text-porcelain font-medium mb-4">Season Distribution</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-cloudburst">Summer</span>
                    <span className="text-porcelain bg-carbon px-2 py-1 rounded-md border border-starlight/10">{analytics.summer_clothes_count}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-cloudburst">Winter</span>
                    <span className="text-porcelain bg-carbon px-2 py-1 rounded-md border border-starlight/10">{analytics.winter_clothes_count}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-cloudburst">Monsoon/Rainy</span>
                    <span className="text-porcelain bg-carbon px-2 py-1 rounded-md border border-starlight/10">{analytics.monsoon_clothes_count}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-cloudburst">All Season</span>
                    <span className="text-porcelain bg-carbon px-2 py-1 rounded-md border border-starlight/10">{analytics.all_season_clothes_count}</span>
                  </div>
                </div>
              </Card>

              {/* Color Breakdown */}
              <Card variant="basic" className="p-6">
                <h3 className="text-porcelain font-medium mb-4">Top Colors</h3>
                {analytics.wardrobe_breakdown_by_color.length > 0 ? (
                  <div className="space-y-3 text-sm">
                    {analytics.wardrobe_breakdown_by_color.map((col: any) => (
                      <div key={col.color} className="flex justify-between items-center">
                        <span className="text-cloudburst">{col.color}</span>
                        <span className="text-porcelain bg-carbon px-2 py-1 rounded-md border border-starlight/10">{col.count}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-cloudburst">No color data yet.</p>
                )}
              </Card>
            </div>
          </>
        )}

      </div>
    </div>
  );
}
