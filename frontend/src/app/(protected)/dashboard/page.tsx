"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/hooks/useAuth";
import { Shirt, Sparkles, CloudSun, UploadCloud, Heart } from "lucide-react";
import Link from "next/link";
import api from "@/lib/api";
import { AnalyticsDashboard } from "@/lib/types";

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<AnalyticsDashboard | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get("/analytics/dashboard");
        setStats(res.data);
      } catch (error) {
        console.error("Failed to fetch dashboard stats", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div>
      <PageHeader 
        title={`Welcome back, ${user?.full_name?.split(" ")[0] || "Stylist"}`}
        description="Here is what is happening with your wardrobe today."
      />

      {loading ? (
        <div className="py-20 flex justify-center"><Spinner size="lg" /></div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard 
              title="Total Items" 
              value={stats?.total_items || 0} 
              icon={<Shirt className="h-6 w-6" />} 
            />
            <StatCard 
              title="Saved Outfits" 
              value={stats?.total_outfits_saved || 0} 
              icon={<Heart className="h-6 w-6" />} 
            />
            <StatCard 
              title="Times Worn" 
              value={stats?.total_outfits_worn || 0} 
              icon={<Sparkles className="h-6 w-6" />} 
            />
            <StatCard 
              title="Top Category" 
              value={Object.entries(stats?.category_distribution || {}).sort((a, b) => b[1] - a[1])[0]?.[0] || "-"} 
              icon={<BarChart3 className="h-6 w-6" />} 
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Link href="/upload" className="block">
                  <div className="flex items-center gap-4 p-4 rounded-xl border border-white/5 hover:bg-white/5 transition-colors cursor-pointer group">
                    <div className="p-3 bg-cyber-cyan/10 rounded-lg text-cyber-cyan group-hover:bg-cyber-cyan group-hover:text-inkwell transition-colors">
                      <UploadCloud className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-medium text-porcelain">Upload Clothing</h4>
                      <p className="text-sm text-cloudburst">Add a new item to your wardrobe via AI analysis.</p>
                    </div>
                  </div>
                </Link>

                <Link href="/outfits/recommendations" className="block">
                  <div className="flex items-center gap-4 p-4 rounded-xl border border-white/5 hover:bg-white/5 transition-colors cursor-pointer group">
                    <div className="p-3 bg-cyber-cyan/10 rounded-lg text-cyber-cyan group-hover:bg-cyber-cyan group-hover:text-inkwell transition-colors">
                      <Sparkles className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-medium text-porcelain">Generate Outfit</h4>
                      <p className="text-sm text-cloudburst">Get AI styling recommendations for your occasion.</p>
                    </div>
                  </div>
                </Link>

                <Link href="/weather-style" className="block">
                  <div className="flex items-center gap-4 p-4 rounded-xl border border-white/5 hover:bg-white/5 transition-colors cursor-pointer group">
                    <div className="p-3 bg-cyber-cyan/10 rounded-lg text-cyber-cyan group-hover:bg-cyber-cyan group-hover:text-inkwell transition-colors">
                      <CloudSun className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-medium text-porcelain">Weather Style</h4>
                      <p className="text-sm text-cloudburst">Check current conditions and how to dress.</p>
                    </div>
                  </div>
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Wardrobe Highlights</CardTitle>
                <Link href="/wardrobe">
                  <Button variant="ghost" size="sm">View All</Button>
                </Link>
              </CardHeader>
              <CardContent>
                {stats?.most_worn_items?.length ? (
                  <div className="grid grid-cols-3 gap-2">
                    {stats.most_worn_items.slice(0, 3).map((item, i) => (
                      <div key={i} className="aspect-square rounded-lg bg-charcoal/80 overflow-hidden relative border border-white/5">
                        {item.front_image_url ? (
                          <img src={item.front_image_url} alt={item.type} className="object-cover w-full h-full" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Shirt className="h-8 w-8 text-white/20" />
                          </div>
                        )}
                        <div className="absolute bottom-0 inset-x-0 p-2 bg-gradient-to-t from-black/80 to-transparent">
                          <p className="text-xs font-medium text-white truncate">{item.type}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-cloudburst">
                    <p>No items worn yet.</p>
                    <Link href="/outfits/saved" className="text-cyber-cyan hover:underline mt-2 inline-block">
                      Start logging outfits
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}

// Ensure BarChart3 is defined for top category
import { BarChart3 } from "lucide-react";
