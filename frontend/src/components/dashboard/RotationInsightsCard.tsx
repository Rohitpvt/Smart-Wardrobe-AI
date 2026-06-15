"use client";

import React from "react";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { RotationInsightsResponse } from "@/types/dashboard";
import { RefreshCw, AlertCircle, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface RotationInsightsCardProps {
  data: RotationInsightsResponse;
}

export function RotationInsightsCard({ data }: RotationInsightsCardProps) {
  const scoreColor =
    data.rotation_score >= 80 ? "text-emerald-400" :
    data.rotation_score >= 60 ? "text-blue-400" :
    data.rotation_score >= 40 ? "text-amber-400" : "text-red-400";

  const scoreBg =
    data.rotation_score >= 80 ? "bg-emerald-500/10 border-emerald-500/20" :
    data.rotation_score >= 60 ? "bg-blue-500/10 border-blue-500/20" :
    data.rotation_score >= 40 ? "bg-amber-500/10 border-amber-500/20" : "bg-red-500/10 border-red-500/20";

  return (
    <GlassPanel className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-white">Rotation Health</h2>
          <p className="text-sm text-zinc-400">How evenly you use your wardrobe.</p>
        </div>
        <div className="h-10 w-10 rounded-full bg-cyan-500/10 flex items-center justify-center">
          <RefreshCw className="w-5 h-5 text-cyan-400" />
        </div>
      </div>

      {/* Score Gauge */}
      <div className={cn("p-4 rounded-xl border flex items-center justify-between mb-5", scoreBg)}>
        <div>
          <p className="text-sm font-medium text-white">Rotation Score</p>
          <p className="text-xs text-zinc-400">Higher is more balanced</p>
        </div>
        <div className={cn("text-3xl font-bold tracking-tighter", scoreColor)}>
          {data.rotation_score}
        </div>
      </div>

      <div className="space-y-4">
        {/* Overused Items */}
        {data.overused.length > 0 && (
          <div>
            <div className="flex items-center space-x-2 text-zinc-400 mb-2">
              <AlertCircle className="w-4 h-4 text-red-400" />
              <span className="text-sm font-medium">Overused Items</span>
            </div>
            <div className="space-y-1.5">
              {data.overused.slice(0, 3).map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-2 rounded-lg bg-red-500/5 border border-red-500/10"
                >
                  <span className="text-sm text-zinc-300 truncate max-w-[160px]">{item.name}</span>
                  <span className="text-xs font-bold text-red-400">Overused</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Suggested Rotation */}
        {data.recommended_rotation.length > 0 && (
          <div>
            <div className="flex items-center space-x-2 text-zinc-400 mb-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span className="text-sm font-medium">Try These Next</span>
            </div>
            <div className="space-y-1.5">
              {data.recommended_rotation.slice(0, 3).map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-2 rounded-lg bg-emerald-500/5 border border-emerald-500/10"
                >
                  <span className="text-sm text-zinc-300 truncate max-w-[160px]">{item.name}</span>
                  <span className="text-xs text-emerald-400">{item.category}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Insights */}
        {data.insights.length > 0 && (
          <div className="pt-3 border-t border-white/10">
            <ul className="space-y-1.5">
              {data.insights.map((insight, i) => (
                <li key={i} className="text-xs text-zinc-400 leading-relaxed">
                  • {insight}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </GlassPanel>
  );
}
