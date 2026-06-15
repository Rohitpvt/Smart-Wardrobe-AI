"use client";

import React from "react";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { TasteProfileResponse } from "@/types/dashboard";
import { SlidersHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

interface PreferenceInsightsCardProps {
  data: TasteProfileResponse;
}

export function PreferenceInsightsCard({ data }: PreferenceInsightsCardProps) {
  const { colors, categories, formality } = data.preference_weights;

  // Helper to get top N from a weight dict
  const getTopKeys = (dict: Record<string, number>, limit: number) => {
    return Object.entries(dict)
      .sort((a, b) => b[1] - a[1])
      .filter(([_, weight]) => weight > 0)
      .slice(0, limit);
  };

  const topColors = getTopKeys(colors, 3);
  const topCategories = getTopKeys(categories, 3);
  const topFormality = getTopKeys(formality, 2);

  return (
    <GlassPanel className="p-6 flex flex-col h-full">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0 border border-blue-500/20">
          <SlidersHorizontal className="w-5 h-5 text-blue-400" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white tracking-tight">Learned Preferences</h3>
          <p className="text-xs text-slate-400">Dynamic weights adjusting outfit rankings.</p>
        </div>
      </div>

      <div className="space-y-6 flex-1">
        {/* Colors */}
        <div>
          <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Top Colors</h4>
          {topColors.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {topColors.map(([name, weight]) => (
                <div key={name} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-2 border border-white/5">
                  <span className="w-3 h-3 rounded-full border border-white/20" style={{ backgroundColor: name }} />
                  <span className="text-xs text-slate-300 capitalize">{name}</span>
                  <span className="text-[10px] text-blue-400 font-medium">+{weight}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-500 italic">No color preferences learned yet.</p>
          )}
        </div>

        {/* Categories */}
        <div>
          <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Top Categories</h4>
          {topCategories.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {topCategories.map(([name, weight]) => (
                <div key={name} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-2 border border-white/5">
                  <span className="text-xs text-slate-300 capitalize">{name.replace("_", " ")}</span>
                  <span className="text-[10px] text-purple-400 font-medium">+{weight}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-500 italic">No category preferences learned yet.</p>
          )}
        </div>

        {/* Formality */}
        <div>
          <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Formality Bias</h4>
          {topFormality.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {topFormality.map(([name, weight]) => (
                <div key={name} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-2 border border-white/5">
                  <span className="text-xs text-slate-300 capitalize">{name}</span>
                  <span className="text-[10px] text-emerald-400 font-medium">+{weight}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-500 italic">No formality preferences learned yet.</p>
          )}
        </div>
      </div>
    </GlassPanel>
  );
}
