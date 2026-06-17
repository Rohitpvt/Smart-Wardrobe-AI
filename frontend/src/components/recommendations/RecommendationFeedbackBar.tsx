"use client";

import { useStyleMemory } from "@/hooks/use-style-memory";
import { FeedbackType } from "@/types/style-memory";
import { ThumbsUp, Heart, ThumbsDown, Bookmark, Shirt, FastForward, Loader2 } from "lucide-react";
import { useState } from "react";

interface Props {
  outfitId: string;
}

export function RecommendationFeedbackBar({ outfitId }: Props) {
  const { feedbackMutation } = useStyleMemory();
  const [activeAction, setActiveAction] = useState<FeedbackType | null>(null);

  const handleFeedback = (type: FeedbackType) => {
    setActiveAction(type);
    feedbackMutation.mutate(
      { outfit_id: outfitId, feedback_type: type },
      {
        onSettled: () => setActiveAction(null)
      }
    );
  };

  const isPending = feedbackMutation.isPending;

  return (
    <div className="flex flex-wrap items-center gap-2 pt-4 border-t border-white/5">
      <button
        onClick={() => handleFeedback('like')}
        disabled={isPending}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 text-xs font-medium text-slate-300 transition-colors disabled:opacity-50"
      >
        {activeAction === 'like' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ThumbsUp className="w-3.5 h-3.5" />}
        Like
      </button>

      <button
        onClick={() => handleFeedback('love')}
        disabled={isPending}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-rose-500/10 hover:bg-rose-500/20 text-xs font-medium text-rose-400 border border-rose-500/20 transition-colors disabled:opacity-50"
      >
        {activeAction === 'love' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Heart className="w-3.5 h-3.5" />}
        Love
      </button>

      <button
        onClick={() => handleFeedback('wore_it')}
        disabled={isPending}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-brand-purple/10 hover:bg-brand-purple/20 text-xs font-medium text-brand-purple border border-brand-purple/20 transition-colors disabled:opacity-50"
      >
        {activeAction === 'wore_it' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Shirt className="w-3.5 h-3.5" />}
        Wore This
      </button>

      <div className="w-px h-4 bg-white/10 mx-1"></div>

      <button
        onClick={() => handleFeedback('save_for_later')}
        disabled={isPending}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 text-xs font-medium text-slate-300 transition-colors disabled:opacity-50"
      >
        {activeAction === 'save_for_later' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Bookmark className="w-3.5 h-3.5" />}
        Save
      </button>

      <div className="flex-1"></div>

      <button
        onClick={() => handleFeedback('skip')}
        disabled={isPending}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 text-xs font-medium text-slate-400 transition-colors disabled:opacity-50"
      >
        {activeAction === 'skip' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FastForward className="w-3.5 h-3.5" />}
        Skip
      </button>

      <button
        onClick={() => handleFeedback('dislike')}
        disabled={isPending}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-500/10 hover:bg-red-500/20 text-xs font-medium text-red-400 transition-colors disabled:opacity-50"
      >
        {activeAction === 'dislike' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ThumbsDown className="w-3.5 h-3.5" />}
        Dislike
      </button>
    </div>
  );
}
