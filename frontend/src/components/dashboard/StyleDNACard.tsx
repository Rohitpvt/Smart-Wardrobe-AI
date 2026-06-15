"use client";

import React from "react";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { StyleDNAResponse } from "@/types/dashboard";
import { Fingerprint, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface StyleDNACardProps {
  data: StyleDNAResponse;
}

export function StyleDNACard({ data }: StyleDNACardProps) {
  const confidenceColor =
    data.confidence >= 80 ? "text-emerald-400" :
    data.confidence >= 60 ? "text-blue-400" :
    data.confidence >= 40 ? "text-amber-400" : "text-zinc-400";

  return (
    <GlassPanel className="p-6 relative overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-purple-500/10 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none" />

      <div className="flex items-center justify-between mb-6 relative z-10">
        <div>
          <h2 className="text-xl font-semibold text-white">Style DNA</h2>
          <p className="text-sm text-zinc-400">Your personal style fingerprint.</p>
        </div>
        <div className="h-10 w-10 rounded-full bg-purple-500/10 flex items-center justify-center">
          <Fingerprint className="w-5 h-5 text-purple-400" />
        </div>
      </div>

      <div className="relative z-10 space-y-5">
        {/* Style Type */}
        <div className="p-4 rounded-xl bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-zinc-400 mb-1">Identified Style</p>
              <p className="text-lg font-bold text-white">{data.style_type}</p>
            </div>
            <div className="text-right">
              <span className={cn("text-2xl font-bold", confidenceColor)}>{data.confidence}%</span>
              <p className="text-[10px] uppercase tracking-widest text-zinc-400">Confidence</p>
            </div>
          </div>
        </div>

        {/* Traits */}
        <div>
          <p className="text-sm font-medium text-zinc-400 mb-2">Style Traits</p>
          <div className="flex flex-wrap gap-2">
            {data.traits.map((trait, i) => (
              <span
                key={i}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/5 text-xs text-zinc-300"
              >
                <Sparkles className="w-3 h-3 text-purple-400" />
                {trait}
              </span>
            ))}
          </div>
        </div>

        {/* Color Palette */}
        {data.dominant_colors.length > 0 && (
          <div>
            <p className="text-sm font-medium text-zinc-400 mb-2">Dominant Palette</p>
            <div className="flex gap-2">
              {data.dominant_colors.map((color) => (
                <div key={color.name} className="flex flex-col items-center gap-1">
                  <div
                    className="w-8 h-8 rounded-full border-2 border-white/10 shadow-inner"
                    style={{ backgroundColor: color.name.toLowerCase() }}
                    title={color.name}
                  />
                  <span className="text-[10px] text-zinc-500 capitalize">{color.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Formality & Season */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-lg bg-white/5 border border-white/5">
            <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-1">Formality</p>
            <p className="text-sm font-medium text-white capitalize">{data.formality}</p>
          </div>
          <div className="p-3 rounded-lg bg-white/5 border border-white/5">
            <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-1">Season</p>
            <p className="text-sm font-medium text-white capitalize">{data.seasonal_preference.replace("_", " ")}</p>
          </div>
        </div>
      </div>
    </GlassPanel>
  );
}
