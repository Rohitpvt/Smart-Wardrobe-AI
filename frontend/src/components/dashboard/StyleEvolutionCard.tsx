"use client";

import React from "react";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { TasteProfileResponse } from "@/types/dashboard";
import { TrendingUp, Sparkles } from "lucide-react";

interface StyleEvolutionCardProps {
  data: TasteProfileResponse;
}

export function StyleEvolutionCard({ data }: StyleEvolutionCardProps) {
  const insights = data.style_evolution;

  return (
    <GlassPanel className="p-6 flex flex-col h-full relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-500/5 to-transparent rounded-full blur-2xl -translate-y-1/2 translate-x-1/4 pointer-events-none" />

      <div className="flex items-center gap-3 mb-6 relative z-10">
        <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0 border border-emerald-500/20">
          <TrendingUp className="w-5 h-5 text-emerald-400" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white tracking-tight">Style Evolution</h3>
          <p className="text-xs text-slate-400">Historical trend analysis.</p>
        </div>
      </div>

      <div className="space-y-4 flex-1 relative z-10">
        {insights.length === 0 ? (
          <p className="text-sm text-slate-400 italic">No historical data available yet.</p>
        ) : (
          insights.map((insight, idx) => (
            <div key={idx} className="flex items-start gap-3 p-4 rounded-xl bg-surface-2/50 border border-white/5 group-hover:border-white/10 transition-colors">
              <Sparkles className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <p className="text-sm text-slate-300 leading-relaxed">{insight}</p>
            </div>
          ))
        )}
      </div>
    </GlassPanel>
  );
}
