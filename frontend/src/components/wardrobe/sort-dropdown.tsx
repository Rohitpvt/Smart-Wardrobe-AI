"use client";

import { ArrowDownAZ, ArrowUpAZ } from "lucide-react";

interface SortDropdownProps {
  sortBy: string;
  sortOrder: "asc" | "desc";
  onSortByChange: (value: string) => void;
  onSortOrderChange: (value: "asc" | "desc") => void;
}

const SORT_OPTIONS = [
  { value: "created_at", label: "Date Added" },
  { value: "name", label: "Name" },
  { value: "category", label: "Category" },
  { value: "color", label: "Color" },
];

export function SortDropdown({ sortBy, sortOrder, onSortByChange, onSortOrderChange }: SortDropdownProps) {
  return (
    <div className="flex gap-2">
      <select
        value={sortBy}
        onChange={(e) => onSortByChange(e.target.value)}
        className="px-4 py-2.5 rounded-xl border border-white/10 bg-surface-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-brand-blue/50 focus:border-brand-blue/50 transition-colors appearance-none cursor-pointer hover:bg-surface-3"
      >
        {SORT_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      <button
        onClick={() => onSortOrderChange(sortOrder === "asc" ? "desc" : "asc")}
        className="px-3 py-2.5 rounded-xl border border-white/10 bg-surface-2 text-slate-300 hover:text-white hover:bg-surface-3 hover:border-white/20 transition-all flex items-center justify-center min-w-[44px]"
        title={sortOrder === "asc" ? "Ascending" : "Descending"}
      >
        {sortOrder === "asc" ? <ArrowUpAZ className="w-5 h-5" /> : <ArrowDownAZ className="w-5 h-5" />}
      </button>
    </div>
  );
}
