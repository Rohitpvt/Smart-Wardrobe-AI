"use client";

import React from "react";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { PurchaseRecommendationsResponse } from "@/types/dashboard";
import { ShoppingBag, ChevronRight, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

interface PurchaseRecommendationsCardProps {
  data: PurchaseRecommendationsResponse;
}

export function PurchaseRecommendationsCard({ data }: PurchaseRecommendationsCardProps) {
  const priorityStyles: Record<string, { bg: string; text: string; label: string }> = {
    high: { bg: "bg-red-500/10 border-red-500/20", text: "text-red-400", label: "High" },
    medium: { bg: "bg-amber-500/10 border-amber-500/20", text: "text-amber-400", label: "Medium" },
    low: { bg: "bg-blue-500/10 border-blue-500/20", text: "text-blue-400", label: "Low" },
  };

  return (
    <GlassPanel className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-white">Smart Purchases</h2>
          <p className="text-sm text-zinc-400">What to buy next for maximum impact.</p>
        </div>
        <div className="h-10 w-10 rounded-full bg-amber-500/10 flex items-center justify-center">
          <ShoppingBag className="w-5 h-5 text-amber-400" />
        </div>
      </div>

      {data.recommendations.length === 0 ? (
        <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/15 text-center">
          <p className="text-sm text-emerald-300">Your wardrobe is well-stocked! No urgent purchases needed.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {data.recommendations.map((rec, i) => {
            const style = priorityStyles[rec.priority] || priorityStyles.low;
            return (
              <div
                key={i}
                className={cn(
                  "p-4 rounded-xl border transition-all hover:-translate-y-[1px]",
                  style.bg
                )}
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={cn(
                          "px-2 py-0.5 rounded-md border text-[10px] uppercase tracking-widest font-bold",
                          style.bg, style.text
                        )}
                      >
                        {style.label}
                      </span>
                      <span className="text-sm font-medium text-white capitalize">{rec.category.replace("_", " ")}</span>
                    </div>
                    <p className="text-xs text-zinc-400 leading-relaxed">{rec.reason}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 mt-3 pt-3 border-t border-white/5">
                  <div className="flex items-center gap-1.5">
                    <Zap className="w-3 h-3 text-amber-400" />
                    <span className="text-xs text-zinc-300">
                      +{rec.expected_outfit_gain} outfits
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-zinc-500 uppercase">Confidence:</span>
                    <span className="text-xs font-bold text-zinc-300">{rec.confidence}%</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </GlassPanel>
  );
}
