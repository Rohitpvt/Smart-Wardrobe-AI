"use client";

import { RecommendationExplanation } from "@/types/recommendations";
import { RecommendationConfidenceBadge } from "./RecommendationConfidenceBadge";
import { RecommendationSignals } from "./RecommendationSignals";
import { RecommendationReasoningPanel } from "./RecommendationReasoningPanel";
import { RecommendationImprovementSuggestions } from "./RecommendationImprovementSuggestions";
import { RecommendationFeedbackBar } from "./RecommendationFeedbackBar";

interface Props {
  explanation: RecommendationExplanation;
}

export function RecommendationExplanationCard({ explanation }: Props) {
  return (
    <div className="bg-surface-1 border border-white/5 rounded-2xl p-6 space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-xl font-heading font-bold text-white mb-1">Why This Outfit?</h3>
          <p className="text-sm text-slate-400">AI Stylist Analysis</p>
        </div>
        <RecommendationConfidenceBadge confidence={explanation.confidence} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <RecommendationReasoningPanel reasoning={explanation.reasoning} />
          <RecommendationImprovementSuggestions suggestions={explanation.improvement_suggestions} />
        </div>
        
        <div className="bg-white/5 border border-white/5 rounded-xl p-5 h-fit">
          <div className="text-xs font-label-md text-slate-500 uppercase tracking-wider mb-4">Intelligence Signals</div>
          <RecommendationSignals signals={explanation.signals} />
        </div>
      </div>
      
      {explanation.outfit_id && (
        <RecommendationFeedbackBar outfitId={explanation.outfit_id} />
      )}
    </div>
  );
}
