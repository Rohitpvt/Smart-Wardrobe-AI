"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import { ThumbsUp, Heart, ThumbsDown, Loader2 } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import { m } from "framer-motion";

interface Props {
  outfitId: string;
}

export function RecommendationFeedbackBar({ outfitId }: Props) {
  const queryClient = useQueryClient();
  const [ratingState, setRatingState] = useState<"IDLE" | "PENDING_UNDO" | "SUBMITTED">("IDLE");
  const [selectedRating, setSelectedRating] = useState<string | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current && ratingState === "PENDING_UNDO" && selectedRating) {
        clearTimeout(timerRef.current);
        feedbackMutation.mutate(selectedRating);
      }
    };
  }, [ratingState, selectedRating]);

  const feedbackMutation = useMutation({
    mutationFn: async (rating: string) => {
      const res = await api.post(`/recommendations/${outfitId}/feedback`, { rating });
      return res.data;
    },
    onSuccess: () => {
      setRatingState("SUBMITTED");
      queryClient.invalidateQueries({ queryKey: ["dashboard-taste-profile"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-predictive"] });
    },
    onError: () => {
      toast.error("Failed to record feedback.");
      setRatingState("IDLE");
      setSelectedRating(null);
    }
  });

  const handleRate = (rating: string) => {
    setSelectedRating(rating);
    setRatingState("PENDING_UNDO");
    
    toast.success(`Rated as ${rating.replace("_", " ")}`, {
      description: "Your personal stylist is learning. You can undo this for 10 seconds.",
      action: {
        label: "Undo",
        onClick: handleUndo
      },
      duration: 10000,
    });

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      if (ratingState !== "SUBMITTED") {
        feedbackMutation.mutate(rating);
      }
    }, 10000);
  };

  const handleUndo = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setRatingState("IDLE");
    setSelectedRating(null);
    toast("Feedback cancelled.");
  };

  return (
    <div className="flex flex-wrap items-center gap-2 pt-4 border-t border-white/5">
      {ratingState === "IDLE" ? (
        <div className="flex flex-wrap items-center justify-center gap-3">
          <button 
            onClick={() => handleRate("LOVE")}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-2 border border-white/10 hover:border-pink-500/50 hover:bg-pink-500/10 hover:text-pink-400 transition-all text-xs font-medium text-slate-300"
          >
            <Heart className="w-3.5 h-3.5" /> Love It
          </button>
          <button 
            onClick={() => handleRate("LIKE")}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-2 border border-white/10 hover:border-blue-500/50 hover:bg-blue-500/10 hover:text-blue-400 transition-all text-xs font-medium text-slate-300"
          >
            <ThumbsUp className="w-3.5 h-3.5" /> Like It
          </button>
          <button 
            onClick={() => handleRate("NEUTRAL")}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-2 border border-white/10 hover:border-slate-500/50 hover:bg-slate-500/10 hover:text-slate-400 transition-all text-xs font-medium text-slate-300"
          >
            😐 Neutral
          </button>
          <button 
            onClick={() => handleRate("DISLIKE")}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-2 border border-white/10 hover:border-red-500/50 hover:bg-red-500/10 hover:text-red-400 transition-all text-xs font-medium text-slate-300"
          >
            <ThumbsDown className="w-3.5 h-3.5" /> Not My Style
          </button>
        </div>
      ) : (
        <m.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center gap-4 bg-surface-2/50 px-4 py-2 rounded-full border border-white/5"
        >
          <span className="text-xs font-medium text-slate-300">
            {ratingState === "PENDING_UNDO" ? "Feedback recorded." : "Thanks for your feedback!"}
          </span>
          
          {ratingState === "PENDING_UNDO" && (
            <button 
              onClick={handleUndo}
              className="text-[10px] font-semibold text-brand-blue hover:text-blue-400 uppercase tracking-wider"
            >
              Undo
            </button>
          )}
        </m.div>
      )}
    </div>
  );
}
