"use client";

import { CATEGORIES, SEASONS } from "@/types/wardrobe";
import { Filter } from "lucide-react";

interface FilterPanelProps {
  category: string;
  season: string;
  onCategoryChange: (value: string) => void;
  onSeasonChange: (value: string) => void;
}

export function FilterPanel({ category, season, onCategoryChange, onSeasonChange }: FilterPanelProps) {
  return (
    <div className="flex flex-wrap gap-3 items-center">
      <div className="hidden sm:flex items-center justify-center w-10 h-10 rounded-xl bg-white/5 border border-white/10 text-slate-400">
        <Filter className="w-4 h-4" />
      </div>
      <select
        value={category}
        onChange={(e) => onCategoryChange(e.target.value)}
        className="px-4 py-2.5 rounded-xl border border-white/10 bg-surface-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-brand-blue/50 focus:border-brand-blue/50 transition-colors appearance-none cursor-pointer hover:bg-surface-3"
      >
        <option value="">All Categories</option>
        {CATEGORIES.map((cat) => (
          <option key={cat} value={cat}>
            {cat.charAt(0) + cat.slice(1).toLowerCase()}
          </option>
        ))}
      </select>

      <select
        value={season}
        onChange={(e) => onSeasonChange(e.target.value)}
        className="px-4 py-2.5 rounded-xl border border-white/10 bg-surface-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-brand-blue/50 focus:border-brand-blue/50 transition-colors appearance-none cursor-pointer hover:bg-surface-3"
      >
        <option value="">All Seasons</option>
        {SEASONS.map((s) => (
          <option key={s} value={s}>
            {s.replace("_", " ").charAt(0) + s.replace("_", " ").slice(1).toLowerCase()}
          </option>
        ))}
      </select>
    </div>
  );
}
