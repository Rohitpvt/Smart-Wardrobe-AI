"use client";

import { PaginationMeta } from "@/types/wardrobe";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  pagination: PaginationMeta;
  onPageChange: (page: number) => void;
}

export function Pagination({ pagination, onPageChange }: PaginationProps) {
  const { page, total_pages } = pagination;

  if (total_pages <= 1) return null;

  const pages: number[] = [];
  const maxVisible = 5;
  let start = Math.max(1, page - Math.floor(maxVisible / 2));
  let end = Math.min(total_pages, start + maxVisible - 1);
  if (end - start + 1 < maxVisible) {
    start = Math.max(1, end - maxVisible + 1);
  }
  for (let i = start; i <= end; i++) pages.push(i);

  return (
    <div className="flex items-center justify-center gap-2 mt-12 mb-8">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        className="flex items-center justify-center w-10 h-10 rounded-xl bg-surface-2 border border-white/10 text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-surface-3 hover:text-white hover:border-white/20 transition-all"
        aria-label="Previous page"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      <div className="flex items-center gap-1">
        {pages.map((p) => (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className={`w-10 h-10 rounded-xl text-sm font-medium transition-all ${
              p === page
                ? "bg-brand-blue text-white border-brand-blue shadow-[0_0_15px_rgba(59,130,246,0.3)]"
                : "bg-surface-2 border border-white/10 text-slate-300 hover:bg-surface-3 hover:text-white hover:border-white/20"
            }`}
          >
            {p}
          </button>
        ))}
      </div>

      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page >= total_pages}
        className="flex items-center justify-center w-10 h-10 rounded-xl bg-surface-2 border border-white/10 text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-surface-3 hover:text-white hover:border-white/20 transition-all"
        aria-label="Next page"
      >
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  );
}
