import { OutfitRecommendation, ClothingItemMinimal } from "@/types/recommendations";
import { WeatherBadge } from "./WeatherBadge";
import { getImageUrl } from "@/lib/image-url";
import { Trash2, Sparkles, Wand2, ThumbsUp, Heart, ThumbsDown, Shirt, Bookmark } from "lucide-react";
import { m } from "framer-motion";
import { OutfitIntelligencePanel } from "./OutfitIntelligencePanel";
import Image from "next/image";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import { toast } from "sonner";
import { useState, useRef, useEffect } from "react";

interface OutfitCardProps {
  recommendation: OutfitRecommendation;
  onDelete?: (id: string) => void;
  isDeleting?: boolean;
}

export function OutfitCard({ recommendation, onDelete, isDeleting }: OutfitCardProps) {
  const queryClient = useQueryClient();
  const [ratingState, setRatingState] = useState<"IDLE" | "PENDING_UNDO" | "SUBMITTED">("IDLE");
  const [selectedRating, setSelectedRating] = useState<string | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      // Clear timeout on unmount. If they navigate away before 10s, we should ideally submit it immediately, but for simplicity we'll just clear it or let it fire.
      // Actually, if we let it fire, the mutation might fail if queryClient is unmounted. Let's just submit if unmounting.
      if (timerRef.current && ratingState === "PENDING_UNDO" && selectedRating) {
        clearTimeout(timerRef.current);
        feedbackMutation.mutate(selectedRating);
      }
    };
  }, [ratingState, selectedRating]);

  const feedbackMutation = useMutation({
    mutationFn: async (rating: string) => {
      const res = await api.post(`/recommendations/${recommendation.id}/feedback`, { rating });
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

  const renderItem = (item: ClothingItemMinimal, label: string) => (
    <div className="flex flex-col group">
      <span className="text-[10px] font-label-sm text-slate-500 uppercase tracking-widest mb-3 pl-1">{label}</span>
      <div className="bg-surface-2 rounded-2xl border border-white/5 overflow-hidden group-hover:border-white/15 transition-all shadow-[0_0_20px_rgba(0,0,0,0.2)]">
        <div className="aspect-[3/4] relative bg-[#060816] overflow-hidden">
          {getImageUrl(item.image_url) ? (
            <Image 
              src={getImageUrl(item.image_url) as string} 
              alt={item.name}
              fill
              sizes="(max-width: 768px) 100vw, 33vw"
              unoptimized={true}
              className="object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700 ease-out"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-surface-3">
              <span className="text-4xl opacity-50">👕</span>
            </div>
          )}
          {/* Subtle gradient for text protection */}
          <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent opacity-80 group-hover:opacity-100 transition-opacity duration-300" />
          
          <div className="absolute bottom-0 left-0 right-0 p-4 z-10">
            <h4 className="text-sm font-semibold text-white truncate drop-shadow-md">{item.name}</h4>
            <div className="flex items-center gap-2 mt-1">
              <span className="w-2.5 h-2.5 rounded-full border border-white/20" style={{ backgroundColor: item.color.toLowerCase() }} />
              <p className="text-xs text-slate-300 capitalize truncate">{item.color} • {item.season || "All Season"}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <m.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-surface-1/70 border border-white/10 rounded-3xl overflow-hidden shadow-[0_0_40px_rgba(59,130,246,0.03)] hover:border-brand-blue/30 hover:shadow-[0_0_50px_rgba(59,130,246,0.1)] transition-all duration-500 relative group/card backdrop-blur-xl"
    >
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-brand-blue/10 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none opacity-50 group-hover/card:opacity-100 transition-opacity duration-700" />
      
      <div className="p-6 md:p-8 border-b border-white/5 flex flex-col sm:flex-row sm:items-start justify-between gap-6 relative z-10">
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 bg-brand-blue/10 text-brand-blue px-3 py-1.5 rounded-lg border border-brand-blue/20">
              <Wand2 className="w-4 h-4" />
              <span className="text-xs font-label-md uppercase tracking-wider font-semibold">AI Stylist Pick</span>
            </div>
            <span className="text-xs text-slate-500 font-medium">
              {new Date(recommendation.created_at).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
          </div>
          
          <div>
            <h3 className="text-2xl md:text-3xl font-bold text-white tracking-tight capitalize mb-3">
              {recommendation.occasion} Outfit
            </h3>
            <WeatherBadge weather={recommendation.weather_snapshot} />
          </div>
        </div>
        
        {onDelete && (
          <button
            onClick={() => onDelete(recommendation.id)}
            disabled={isDeleting}
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-red-400 bg-red-500/10 hover:bg-red-500/20 hover:text-red-300 border border-red-500/10 hover:border-red-500/30 rounded-xl transition-all disabled:opacity-50"
            aria-label="Delete recommendation"
          >
            <Trash2 className="w-4 h-4" />
            <span className="hidden sm:inline">{isDeleting ? "Removing..." : "Remove"}</span>
          </button>
        )}
      </div>

      <div className="p-6 md:p-8 relative z-10 bg-gradient-to-b from-transparent to-surface-1/40">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {renderItem(recommendation.top_item, "Topwear")}
          {renderItem(recommendation.bottom_item, "Bottomwear")}
          {renderItem(recommendation.footwear_item, "Footwear")}
        </div>

        {/* ── Phase 9.11A: Feedback Controls ── */}
        <div className="mt-6 flex flex-col items-center justify-center gap-3">
          {ratingState === "IDLE" ? (
            <div className="flex flex-wrap items-center justify-center gap-3">
              <button 
                onClick={() => handleRate("LOVE")}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-surface-2 border border-white/10 hover:border-pink-500/50 hover:bg-pink-500/10 hover:text-pink-400 transition-all text-sm font-medium text-slate-300"
              >
                <Heart className="w-4 h-4" /> Love It
              </button>
              <button 
                onClick={() => handleRate("LIKE")}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-surface-2 border border-white/10 hover:border-blue-500/50 hover:bg-blue-500/10 hover:text-blue-400 transition-all text-sm font-medium text-slate-300"
              >
                <ThumbsUp className="w-4 h-4" /> Like It
              </button>
              <button 
                onClick={() => handleRate("NEUTRAL")}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-surface-2 border border-white/10 hover:border-slate-500/50 hover:bg-slate-500/10 hover:text-slate-400 transition-all text-sm font-medium text-slate-300"
              >
                <span className="text-base leading-none">😐</span> Neutral
              </button>
              <button 
                onClick={() => handleRate("DISLIKE")}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-surface-2 border border-white/10 hover:border-red-500/50 hover:bg-red-500/10 hover:text-red-400 transition-all text-sm font-medium text-slate-300"
              >
                <ThumbsDown className="w-4 h-4" /> Not My Style
              </button>
            </div>
          ) : (
            <m.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-4 bg-surface-2/50 px-6 py-3 rounded-full border border-white/5"
            >
              <span className="text-sm font-medium text-slate-300">
                {ratingState === "PENDING_UNDO" ? "Feedback recorded." : "Thanks for your feedback!"}
              </span>
              
              {ratingState === "PENDING_UNDO" && (
                <button 
                  onClick={handleUndo}
                  className="text-xs font-semibold text-brand-blue hover:text-blue-400 uppercase tracking-wider"
                >
                  Undo
                </button>
              )}
            </m.div>
          )}
        </div>

        <div className="mt-8 bg-surface-2/80 backdrop-blur-md border border-brand-purple/20 rounded-2xl p-6 lg:p-8 relative overflow-hidden group/notes">
          <div className="absolute inset-0 bg-gradient-to-r from-brand-purple/5 to-transparent opacity-0 group-hover/notes:opacity-100 transition-opacity duration-500 pointer-events-none" />
          <div className="flex items-start gap-4 lg:gap-6 relative z-10">
            <div className="w-12 h-12 shrink-0 rounded-xl bg-gradient-to-br from-brand-purple to-brand-blue p-px shadow-[0_0_20px_rgba(139,92,246,0.3)]">
               <div className="w-full h-full bg-surface-1 rounded-[11px] flex items-center justify-center">
                 <Sparkles className="w-6 h-6 text-brand-purple" />
               </div>
            </div>
            <div>
              <h4 className="text-base font-semibold text-white tracking-tight mb-2">Stylist Reasoning</h4>
              <p className="text-sm text-slate-300 leading-relaxed max-w-4xl">
                {recommendation.ai_explanation}
              </p>
            </div>
          </div>
        </div>

        {recommendation.scores && (
          <div className="mt-4">
            <OutfitIntelligencePanel outfit={recommendation} />
          </div>
        )}
      </div>
    </m.div>
  );
}
