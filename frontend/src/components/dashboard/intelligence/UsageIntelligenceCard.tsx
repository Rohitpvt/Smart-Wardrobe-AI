"use client";

import { useUsageIntelligence } from "@/lib/api/intelligence";
import { getImageUrl } from "@/lib/image-url";
import { Skeleton } from "@/components/ui/skeleton";
import { Activity, TrendingDown, TrendingUp, AlertCircle } from "lucide-react";
import Image from "next/image";

export function UsageIntelligenceCard() {
  const { data: usage, isLoading, isError } = useUsageIntelligence();

  if (isLoading) {
    return (
      <div className="p-6 rounded-2xl bg-surface-1 border border-white/5 space-y-4">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-amber-400" />
          <h3 className="font-heading font-semibold text-white">Usage Intelligence</h3>
        </div>
        <Skeleton className="h-32 w-full bg-white/5 rounded-xl" />
      </div>
    );
  }

  if (isError || !usage) {
    return (
      <div className="p-6 rounded-2xl bg-surface-1 border border-white/5 space-y-2">
        <div className="flex items-center gap-2 text-rose-400">
          <AlertCircle className="w-5 h-5" />
          <h3 className="font-heading font-semibold">Usage Data Unavailable</h3>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 rounded-2xl bg-surface-1 border border-white/5 hover:border-white/10 transition-colors group">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-amber-400/10 text-amber-400 ring-1 ring-amber-400/20">
            <Activity className="w-5 h-5" />
          </div>
          <h3 className="font-heading font-semibold text-white group-hover:text-amber-400 transition-colors">Usage Patterns</h3>
        </div>
        <div className="text-right">
          <div className="text-2xl font-heading font-bold text-white">{usage.rotation_quality}%</div>
          <div className="text-xs text-slate-500 uppercase tracking-wider">Rotation Quality</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-3">
          <div className="flex items-center gap-1.5 text-emerald-400">
            <TrendingUp className="w-4 h-4" />
            <span className="text-xs font-label-md uppercase tracking-wider">Top Worn</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {usage.top_worn.length > 0 ? usage.top_worn.map(item => (
              <div key={item.id} className="relative w-12 h-12 rounded-lg overflow-hidden border border-white/10 bg-surface-2" title={`${item.name} (${item.worn_count} wears)`}>
                {getImageUrl(item.image_url) && <Image src={getImageUrl(item.image_url) as string} alt={item.name} fill className="object-cover" unoptimized />}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end justify-center pb-1">
                  <span className="text-[10px] font-bold text-white">{item.worn_count}</span>
                </div>
              </div>
            )) : <span className="text-sm text-slate-500">No wear data yet</span>}
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-1.5 text-rose-400">
            <TrendingDown className="w-4 h-4" />
            <span className="text-xs font-label-md uppercase tracking-wider">Neglected Items</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {usage.least_worn.length > 0 ? usage.least_worn.map(item => (
              <div key={item.id} className="relative w-12 h-12 rounded-lg overflow-hidden border border-white/10 opacity-60 hover:opacity-100 transition-opacity bg-surface-2" title={item.name}>
                {getImageUrl(item.image_url) && <Image src={getImageUrl(item.image_url) as string} alt={item.name} fill className="object-cover" unoptimized />}
              </div>
            )) : <span className="text-sm text-slate-500">No neglected items!</span>}
          </div>
        </div>
      </div>

      {usage.neglected_value > 0 && (
        <div className="mt-6 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-sm text-rose-200">
          You have approximately <strong>${usage.neglected_value}</strong> worth of unworn clothing. Consider donating or styling these items.
        </div>
      )}
    </div>
  );
}
