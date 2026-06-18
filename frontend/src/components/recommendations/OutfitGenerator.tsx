"use client";
import { useState } from "react";
import { Sparkles, Loader2, Target, AlertCircle , Shirt } from "lucide-react";
import axios from "axios";
import { m } from "framer-motion";
import { useExplainableRecommendations } from "@/hooks/use-explainable-recommendations";
import { ExplainableRecommendationResponse } from "@/types/recommendations";
import { RecommendationExplanationCard } from "./RecommendationExplanationCard";
import { getImageUrl } from "@/lib/image-url";

const OCCASIONS = ["CASUAL", "COLLEGE", "OFFICE", "PARTY", "FORMAL"];

interface OutfitGeneratorProps {
  onSuccess?: () => void;
}

export function OutfitGenerator({ onSuccess }: OutfitGeneratorProps) {
  const [occasion, setOccasion] = useState(OCCASIONS[0]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [explainableResult, setExplainableResult] = useState<ExplainableRecommendationResponse | null>(null);
  const { generateExplainableMutation } = useExplainableRecommendations();
  const mutation = generateExplainableMutation;

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setExplainableResult(null);
    mutation.mutate({ occasion, generation_mode: 'standard' }, {
      onSuccess: (data) => {
        setExplainableResult(data);
        if (onSuccess) onSuccess();
      },
      onError: (error: unknown) => {
        if (axios.isAxiosError(error) && error.response) {
          const errorCode = error.response?.data?.detail?.error_code;
          if (errorCode === "INSUFFICIENT_TOPWEAR") {
            setErrorMsg("Your digital wardrobe requires at least one suitable topwear item before the AI can curate a complete outfit.");
          } else if (errorCode === "INSUFFICIENT_BOTTOMWEAR") {
            setErrorMsg("Your digital wardrobe requires at least one suitable bottomwear item before the AI can curate a complete outfit.");
          } else if (errorCode === "INSUFFICIENT_FOOTWEAR") {
            setErrorMsg("Your digital wardrobe requires at least one suitable footwear item before the AI can curate a complete outfit.");
          } else if (errorCode === "NO_VALID_COMBINATION") {
            setErrorMsg("The AI stylist couldn't identify a weather-appropriate and occasion-matching combination from your current collection.");
          } else {
            setErrorMsg(error.response?.data?.detail?.message || "Our AI encountered a temporary issue generating your recommendation. Please try again.");
          }
        } else {
          setErrorMsg("Our AI encountered a temporary issue generating your recommendation. Please try again.");
        }
      }
    });
  };

  return (
    <m.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="bg-surface-1/70 backdrop-blur-xl border border-white/10 rounded-3xl p-8 lg:p-10 shadow-[0_0_50px_rgba(59,130,246,0.03)] relative overflow-hidden group"
    >
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-brand-blue/10 via-brand-purple/5 to-transparent rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3 pointer-events-none transition-opacity duration-1000" />
      
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
        {/* Left: AI Context */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-brand-blue/15 text-brand-blue border border-white/5">
              <Sparkles className="w-5 h-5" />
            </div>
            <span className="text-xs font-label-md text-brand-blue tracking-widest uppercase font-semibold">AI Stylist Engine</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight">Request an Outfit</h2>
          <p className="text-lg text-slate-300 leading-relaxed max-w-xl">
            Our AI will analyze your digital wardrobe, cross-reference the current local weather, and synthesize the perfect look for your specified occasion.
          </p>
        </div>

        {/* Right: Controls */}
        <div className="lg:col-span-5">
          <form onSubmit={handleGenerate} className="bg-surface-2/80 backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-xl space-y-6">
            <div>
              <label htmlFor="occasion" className="flex items-center gap-2 text-xs font-label-md text-slate-400 uppercase tracking-widest mb-3">
                <Target className="w-4 h-4" />
                Target Occasion
              </label>
              <select
                id="occasion"
                value={occasion}
                onChange={(e) => setOccasion(e.target.value)}
                disabled={mutation.isPending}
                className="w-full bg-[#060816]/80 border border-white/10 text-white rounded-xl px-5 py-4 focus:outline-none focus:ring-1 focus:ring-brand-blue/50 focus:border-brand-blue/50 disabled:opacity-50 appearance-none shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)] transition-all cursor-pointer hover:border-white/20"
              >
                {OCCASIONS.map((occ) => (
                  <option key={occ} value={occ}>
                    {occ.charAt(0) + occ.slice(1).toLowerCase()}
                  </option>
                ))}
              </select>
            </div>
            
            <button
              type="submit"
              disabled={mutation.isPending}
              className={`w-full ds-btn-primary py-4 text-base ${mutation.isPending ? 'shadow-[0_0_30px_rgba(59,130,246,0.5)]' : 'shadow-[0_0_20px_rgba(59,130,246,0.3)]'} transition-all`}
            >
              {mutation.isPending ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  Analyzing Wardrobe...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 mr-2" />
                  Generate Recommendation
                </>
              )}
            </button>
            
            <p className="text-center text-xs text-slate-500 font-medium">
              Uses 1 AI Token • Takes ~5 seconds
            </p>
          </form>
        </div>
      </div>

      {errorMsg && (
        <m.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8 p-6 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-start gap-4 relative z-10"
        >
          <div className="p-2 bg-red-500/20 rounded-lg text-red-400 shrink-0">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-red-400 font-semibold mb-1">Stylist Unavailable</h4>
            <p className="text-red-300/80 text-sm leading-relaxed">{errorMsg}</p>
          </div>
        </m.div>
      )}

      {explainableResult && explainableResult.recommendations.length > 0 && (
        <m.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-12 space-y-8 relative z-10"
        >
          {/* We show the explanation card for the first recommendation */}
          <RecommendationExplanationCard explanation={explainableResult.recommendations[0].explanation} />

          {/* Simple outfit preview since existing outfit cards expect full OutfitRecommendation schema */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {['top', 'bottom', 'shoes'].map((cat) => {
              const item = (explainableResult.recommendations[0].recommendation as any)[cat];
              if (!item) return null;
              return (
                <div key={item.id} className="bg-surface-2/50 border border-white/5 rounded-xl p-4 flex flex-col items-center">
                  <div className="w-full aspect-square rounded-lg bg-surface-3/50 flex items-center justify-center overflow-hidden mb-4">
                    {item.image_url ? (
                      getImageUrl(item.image_url) ? <img src={getImageUrl(item.image_url) as string} alt={item.name} className="object-cover w-full h-full" /> : <div className="w-full h-full flex items-center justify-center bg-surface-2 opacity-50"><Shirt className="w-1/2 h-1/2 text-white/30"/></div>
                    ) : (
                      <div className="text-white/20">No Image</div>
                    )}
                  </div>
                  <h4 className="text-sm font-semibold text-white text-center">{item.name}</h4>
                  <p className="text-xs text-slate-400 capitalize mt-1">{cat}</p>
                </div>
              );
            })}
          </div>
        </m.div>
      )}
    </m.div>
  );
}
