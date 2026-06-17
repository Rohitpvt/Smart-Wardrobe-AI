"use client";

import { useSeasonalReadiness } from "@/lib/api/intelligence";
import { Skeleton } from "@/components/ui/skeleton";
import { CloudSun, ShoppingBag, AlertCircle } from "lucide-react";

export function SeasonalReadinessCard() {
  const { data: seasonal, isLoading, isError } = useSeasonalReadiness();

  if (isLoading) {
    return (
      <div className="p-6 rounded-2xl bg-surface-1 border border-white/5 space-y-4">
        <div className="flex items-center gap-2">
          <CloudSun className="w-5 h-5 text-sky-400" />
          <h3 className="font-heading font-semibold text-white">Seasonal Readiness</h3>
        </div>
        <Skeleton className="h-8 w-1/3 bg-white/5" />
        <Skeleton className="h-16 w-full bg-white/5 rounded-xl" />
      </div>
    );
  }

  if (isError || !seasonal) {
    return (
      <div className="p-6 rounded-2xl bg-surface-1 border border-white/5 space-y-2">
        <div className="flex items-center gap-2 text-rose-400">
          <AlertCircle className="w-5 h-5" />
          <h3 className="font-heading font-semibold">Seasonal Data Unavailable</h3>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 rounded-2xl bg-surface-1 border border-white/5 hover:border-white/10 transition-colors group flex flex-col h-full">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-sky-400/10 text-sky-400 ring-1 ring-sky-400/20">
            <CloudSun className="w-5 h-5" />
          </div>
          <h3 className="font-heading font-semibold text-white group-hover:text-sky-400 transition-colors">Seasonal Readiness</h3>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center mb-6">
        <div className="text-4xl font-heading font-bold text-white mb-2">{seasonal.readiness_score}%</div>
        <div className="text-sm font-medium text-slate-400 uppercase tracking-widest">{seasonal.season} Preparedness</div>
      </div>

      {seasonal.recommended_purchases.length > 0 ? (
        <div className="space-y-3 p-4 rounded-xl bg-brand-blue/5 border border-brand-blue/10">
          <div className="flex items-center gap-1.5 text-brand-blue">
            <ShoppingBag className="w-4 h-4" />
            <span className="text-xs font-label-md uppercase tracking-wider">Purchase Suggestions</span>
          </div>
          <ul className="text-sm text-slate-300 pl-5 list-disc space-y-1">
            {seasonal.recommended_purchases.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="p-4 rounded-xl bg-emerald-400/5 border border-emerald-400/10 text-center text-sm text-emerald-200">
          Your wardrobe is fully prepared for {seasonal.season}!
        </div>
      )}
    </div>
  );
}
