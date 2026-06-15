"use client";

import React from "react";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { OutfitRecommendation } from "@/types/recommendations";
import { Star, Cloud, Palette, Target, CalendarDays, Activity } from "lucide-react";
import { cn } from "@/lib/utils";

interface OutfitIntelligencePanelProps {
  outfit: OutfitRecommendation;
}

export function OutfitIntelligencePanel({ outfit }: OutfitIntelligencePanelProps) {
  if (!outfit.scores) {
    return null;
  }

  const {
    overall_score,
    color_score,
    weather_score,
    occasion_score,
    season_score,
    utilization_score,
  } = outfit.scores;

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-emerald-400";
    if (score >= 75) return "text-blue-400";
    if (score >= 60) return "text-amber-400";
    return "text-red-400";
  };

  const getBgColor = (score: number) => {
    if (score >= 90) return "bg-emerald-500/10 border-emerald-500/20";
    if (score >= 75) return "bg-blue-500/10 border-blue-500/20";
    if (score >= 60) return "bg-amber-500/10 border-amber-500/20";
    return "bg-red-500/10 border-red-500/20";
  };

  const metrics = [
    { label: "Color Harmony", value: color_score, icon: Palette },
    { label: "Weather Match", value: weather_score, icon: Cloud },
    { label: "Occasion Fit", value: occasion_score, icon: Target },
    { label: "Season Match", value: season_score, icon: CalendarDays },
    { label: "Wardrobe Util", value: utilization_score, icon: Activity },
  ];

  return (
    <div className="space-y-4">
      <div className={cn("p-4 rounded-xl border flex items-center justify-between", getBgColor(overall_score))}>
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center">
            <Star className={cn("w-5 h-5", getScoreColor(overall_score))} />
          </div>
          <div>
            <p className="text-sm font-medium text-white">Overall Outfit Score</p>
            <p className="text-xs text-zinc-400">Based on multi-dimensional analysis</p>
          </div>
        </div>
        <div className={cn("text-3xl font-bold tracking-tighter", getScoreColor(overall_score))}>
          {overall_score}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {metrics.map((metric, idx) => (
          <GlassPanel key={idx} className="p-3 flex flex-col items-center text-center justify-center space-y-2">
            <metric.icon className={cn("w-5 h-5", getScoreColor(metric.value))} />
            <div>
              <div className={cn("text-lg font-bold", getScoreColor(metric.value))}>{metric.value}</div>
              <div className="text-[10px] uppercase tracking-wider text-zinc-400 mt-0.5">{metric.label}</div>
            </div>
          </GlassPanel>
        ))}
      </div>
    </div>
  );
}
