"use client";

import { CATEGORIES, SEASONS } from "@/types/wardrobe";

interface FilterPanelProps {
  category: string;
  season: string;
  onCategoryChange: (value: string) => void;
  onSeasonChange: (value: string) => void;
}

export function FilterPanel({ category, season, onCategoryChange, onSeasonChange }: FilterPanelProps) {
  return (
    <div className="flex flex-wrap gap-3">
      <select
        value={category}
        onChange={(e) => onCategoryChange(e.target.value)}
        className="px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
        className="px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
