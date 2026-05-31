"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";
import { StatCard } from "@/components/ui/StatCard";
import { useToast } from "@/hooks/useToast";
import api from "@/lib/api";
import { AnalyticsDashboard } from "@/lib/types";
import { BarChart3, Shirt, Flame, RotateCcw, Bookmark } from "lucide-react";
import Image from "next/image";

export default function AnalyticsPage() {
  const [stats, setStats] = useState<AnalyticsDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

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
      showToast("Failed to fetch analytics data.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div>
      <PageHeader 
        title="Wardrobe Analytics" 
        description="Insights into your clothing habits and wardrobe composition."
      />

      {loading || !stats ? (
        <div className="py-20 flex justify-center"><Spinner size="lg" /></div>
      ) : (
        <div className="space-y-6">
          {/* Stat Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard title="Total Items" value={stats.total_items} icon={<Shirt className="h-5 w-5" />} />
            <StatCard title="Saved Combos" value={stats.total_outfits_saved} icon={<Bookmark className="h-5 w-5" />} />
            <StatCard title="Wears Logged" value={stats.total_outfits_worn} icon={<RotateCcw className="h-5 w-5" />} />
            <StatCard 
              title="Usage Rate" 
              value={`${stats.total_items > 0 ? Math.round((stats.total_outfits_worn / stats.total_items) * 100) : 0}%`} 
              icon={<Flame className="h-5 w-5" />} 
              description="Wears per item ratio"
            />
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Category Distribution */}
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-cyber-cyan" /> Category Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(stats.category_distribution || {})
                    .sort((a, b) => b[1] - a[1])
                    .map(([category, count]) => {
                      const percentage = stats.total_items > 0 ? Math.round((count / stats.total_items) * 100) : 0;
                      return (
                        <div key={category}>
                          <div className="flex justify-between text-sm mb-1.5">
                            <span className="text-porcelain capitalize font-medium">{category}</span>
                            <span className="text-cloudburst text-xs">{count} items · {percentage}%</span>
                          </div>
                          <div className="w-full bg-surface-raised rounded-full h-1.5">
                            <div 
                              className="bg-gradient-to-r from-cyber-cyan/80 to-cyber-cyan h-1.5 rounded-full transition-all duration-500" 
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  
                  {Object.keys(stats.category_distribution || {}).length === 0 && (
                    <p className="text-sm text-cloudburst text-center py-6">No clothing categories found yet.</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Most Worn Items */}
            <Card className="h-full">
              <CardHeader>
                <CardTitle>Most Worn Items</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {stats.most_worn_items?.length > 0 ? (
                    stats.most_worn_items.slice(0, 5).map((item, index) => (
                      <div key={item.id || index} className="flex items-center gap-3.5 p-3 bg-surface-raised rounded-xl border border-border-subtle">
                        <div className="w-10 h-10 bg-surface rounded-lg overflow-hidden shrink-0 relative border border-border-subtle">
                          {item.front_image_url ? (
                            <Image src={item.front_image_url} alt={item.type} fill unoptimized sizes="40px" className="object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center"><Shirt className="w-4 h-4 text-white/15" /></div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-porcelain truncate">{item.type}</p>
                          <p className="text-[11px] text-cloudburst capitalize">{item.category}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-lg font-bold text-cyber-cyan">{item.wear_count || 1}</p>
                          <p className="text-[9px] text-cloudburst uppercase tracking-wider">wears</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-cloudburst text-center py-6">No wear history available.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
