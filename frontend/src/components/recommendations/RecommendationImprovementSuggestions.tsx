"use client";

import { ArrowUpRight } from "lucide-react";

interface Props {
  suggestions: string[];
}

export function RecommendationImprovementSuggestions({ suggestions }: Props) {
  if (!suggestions || suggestions.length === 0) return null;

  return (
    <div className="pt-4 border-t border-white/5 space-y-3">
      <div className="text-xs font-label-md text-slate-500 uppercase tracking-wider px-1">
        How to Elevate This Look
      </div>
      <ul className="space-y-2">
        {suggestions.map((suggestion, idx) => (
          <li key={idx} className="flex items-start gap-2.5 text-sm text-slate-400 bg-white/5 rounded-lg p-3">
            <ArrowUpRight className="w-4 h-4 text-brand-purple shrink-0 mt-0.5" />
            <span className="leading-snug">{suggestion}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
