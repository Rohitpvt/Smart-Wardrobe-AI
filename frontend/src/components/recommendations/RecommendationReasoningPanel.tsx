"use client";

import { CheckCircle2, Sparkles } from "lucide-react";
import { RecommendationReasoning } from "@/types/recommendations";

interface Props {
  reasoning: RecommendationReasoning;
}

export function RecommendationReasoningPanel({ reasoning }: Props) {
  return (
    <div className="space-y-4">
      {/* Primary Reason */}
      <div className="p-4 rounded-xl bg-brand-blue/5 border border-brand-blue/10">
        <div className="flex gap-3">
          <Sparkles className="w-5 h-5 text-brand-blue shrink-0 mt-0.5" />
          <p className="text-sm font-medium text-brand-blue/90 leading-relaxed">
            {reasoning.primary_reason}
          </p>
        </div>
      </div>

      {/* Supporting Reasons */}
      {reasoning.supporting_reasons.length > 0 && (
        <div className="space-y-2.5 px-1">
          <div className="text-xs font-label-md text-slate-500 uppercase tracking-wider mb-2">Why It Works</div>
          <ul className="space-y-2">
            {reasoning.supporting_reasons.map((reason, idx) => (
              <li key={idx} className="flex items-start gap-2.5 text-sm text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span className="leading-snug">{reason}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
