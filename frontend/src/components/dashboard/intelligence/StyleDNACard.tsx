"use client";

import { useStyleDNA } from "@/lib/api/intelligence";
import { Skeleton } from "@/components/ui/skeleton";
import { BrainCircuit, Star, AlertCircle } from "lucide-react";

export function StyleDNACard() {
  const { data: styleDna, isLoading, isError } = useStyleDNA();

  if (isLoading) {
    return (
      <div className="p-6 rounded-2xl bg-surface-1 border border-white/5 space-y-4">
        <div className="flex items-center gap-2">
          <BrainCircuit className="w-5 h-5 text-brand-blue" />
          <h3 className="font-heading font-semibold text-white">Style DNA</h3>
        </div>
        <Skeleton className="h-8 w-1/2 bg-white/5" />
        <Skeleton className="h-4 w-3/4 bg-white/5" />
        <Skeleton className="h-4 w-2/3 bg-white/5" />
      </div>
    );
  }

  if (isError || !styleDna) {
    return (
      <div className="p-6 rounded-2xl bg-surface-1 border border-white/5 space-y-2">
        <div className="flex items-center gap-2 text-rose-400">
          <AlertCircle className="w-5 h-5" />
          <h3 className="font-heading font-semibold">Style DNA Unavailable</h3>
        </div>
        <p className="text-sm text-slate-400">Add more items to your wardrobe to generate your Style DNA.</p>
      </div>
    );
  }

  return (
    <div className="p-6 rounded-2xl bg-surface-1 border border-white/5 hover:border-white/10 transition-colors group">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-brand-blue/10 text-brand-blue ring-1 ring-brand-blue/20">
            <BrainCircuit className="w-5 h-5" />
          </div>
          <h3 className="font-heading font-semibold text-white group-hover:text-brand-blue transition-colors">Style DNA</h3>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-brand-purple/10 border border-brand-purple/20">
          <Star className="w-3.5 h-3.5 text-brand-purple fill-brand-purple" />
          <span className="text-xs font-medium text-brand-purple">{styleDna.style_confidence}% Match</span>
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <div className="text-3xl font-heading font-bold text-white mb-1">
            {styleDna.dominant_style}
          </div>
          <div className="text-sm text-slate-400">
            Dominant Archetype
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="text-xs font-label-md text-slate-500 uppercase tracking-wider">Secondary Styles</div>
            <div className="flex flex-wrap gap-2">
              {styleDna.secondary_styles.length > 0 ? styleDna.secondary_styles.map(style => (
                <span key={style} className="text-xs font-medium px-2 py-1 rounded-md bg-white/5 text-slate-300">
                  {style}
                </span>
              )) : <span className="text-xs text-slate-500">None</span>}
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="text-xs font-label-md text-slate-500 uppercase tracking-wider">Color Affinities</div>
            <div className="flex flex-wrap gap-2">
              {styleDna.color_affinities.length > 0 ? styleDna.color_affinities.map(color => (
                <span key={color} className="text-xs font-medium px-2 py-1 rounded-md bg-white/5 text-slate-300">
                  {color}
                </span>
              )) : <span className="text-xs text-slate-500">None</span>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
