"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/hooks/useAuth";
import { Shirt, Sparkles, CloudSun, UploadCloud, Heart, BarChart3 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
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
        const data = res.data;
        const category_distribution: Record<string, number> = {};
        if (data.wardrobe_breakdown_by_category) {
          data.wardrobe_breakdown_by_category.forEach((item: any) => {
            category_distribution[item.category] = item.count;
          });
        }
        setStats({
          ...data,
          total_items: data.total_clothes || 0,
          total_outfits_saved: data.saved_outfits_count || 0,
          total_outfits_worn: data.outfit_history_count || 0,
          category_distribution
        });
      } catch {
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
        description="Here's what's happening with your wardrobe."
      />

      {loading ? (
        <div className="py-20 flex justify-center"><Spinner size="lg" /></div>
      ) : (
        <div className="space-y-6">
          {/* Stats Row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard 
              title="Total Items" 
              value={stats?.total_items || 0} 
              icon={<Shirt className="h-5 w-5" />} 
            />
            <StatCard 
              title="Saved Outfits" 
              value={stats?.total_outfits_saved || 0} 
              icon={<Heart className="h-5 w-5" />} 
            />
            <StatCard 
              title="Times Worn" 
              value={stats?.total_outfits_worn || 0} 
              icon={<Sparkles className="h-5 w-5" />} 
            />
            <StatCard 
              title="Top Category" 
              value={Object.entries(stats?.category_distribution || {}).sort((a, b) => b[1] - a[1])[0]?.[0] || "—"} 
              icon={<BarChart3 className="h-5 w-5" />} 
            />
          </div>

          {/* Quick Actions + Highlights */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Quick Actions — 3 cols */}
            <Card className="lg:col-span-3">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <QuickAction 
                    href="/upload" 
                    icon={<UploadCloud className="h-5 w-5" />} 
                    label="Upload Item" 
                    hint="Add clothing via AI"
                  />
                  <QuickAction 
                    href="/outfits/recommendations" 
                    icon={<Sparkles className="h-5 w-5" />} 
                    label="Get Outfit" 
                    hint="AI recommendations"
                  />
                  <QuickAction 
                    href="/weather-style" 
                    icon={<CloudSun className="h-5 w-5" />} 
                    label="Weather Style" 
                    hint="Check conditions"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Wardrobe Highlights — 2 cols */}
            <Card className="lg:col-span-2">
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
                      <div key={i} className="aspect-square rounded-xl bg-surface-raised overflow-hidden relative border border-border-subtle">
                        {item.front_image_url ? (
                          <Image src={item.front_image_url} alt={item.type} fill unoptimized sizes="(max-width: 768px) 33vw, 20vw" className="object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Shirt className="h-7 w-7 text-white/10" />
                          </div>
                        )}
                        <div className="absolute bottom-0 inset-x-0 p-2 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
                          <p className="text-[11px] font-medium text-white truncate">{item.type}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-cloudburst">
                    <Shirt className="h-8 w-8 mx-auto mb-2 text-white/10" />
                    <p className="text-sm">No items worn yet.</p>
                    <Link href="/outfits/saved" className="text-cyber-cyan text-sm hover:underline mt-1 inline-block">
                      Start logging outfits
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}

function QuickAction({ href, icon, label, hint }: { href: string; icon: React.ReactNode; label: string; hint: string }) {
  return (
    <Link href={href} className="block">
      <div className="flex flex-col items-center text-center p-5 rounded-xl border border-border-subtle bg-surface/50 hover:bg-white/[0.04] hover:border-border-default transition-all duration-200 cursor-pointer group">
        <div className="p-3 bg-cyber-cyan/8 rounded-xl text-cyber-cyan mb-3 group-hover:bg-cyber-cyan group-hover:text-inkwell transition-all duration-200">
          {icon}
        </div>
        <h4 className="text-sm font-medium text-porcelain">{label}</h4>
        <p className="text-[11px] text-cloudburst mt-0.5">{hint}</p>
      </div>
    </Link>
  );
}
