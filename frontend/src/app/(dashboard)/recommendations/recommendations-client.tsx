"use client";

import { OutfitGenerator } from "@/components/recommendations/OutfitGenerator";
import { RecommendationHistory } from "@/components/recommendations/RecommendationHistory";
import { m, Variants } from "framer-motion";
import { Sparkles, CloudSun } from "lucide-react";

import { fadeUp, staggerContainer as stagger } from "@/lib/animations";

export default function RecommendationsClient() {
  return (
    <m.div initial="hidden" animate="visible" variants={stagger} className="max-w-7xl mx-auto space-y-8 pb-16">
      
      {/* ═══ SECTION 1: AI STYLIST HERO ═══ */}
      <m.section variants={fadeUp} className="relative overflow-hidden rounded-[2.5rem] p-10 md:p-16 bg-surface-1/70 backdrop-blur-xl border border-white/10 shadow-[0_0_50px_rgba(139,92,246,0.03)] group">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-br from-brand-purple/15 via-brand-blue/10 to-transparent rounded-full blur-[100px] -translate-y-1/2 translate-x-1/4 pointer-events-none group-hover:from-brand-purple/20 transition-all duration-1000" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-brand-blue/10 to-transparent rounded-full blur-[80px] translate-y-1/2 -translate-x-1/4 pointer-events-none" />
        
        <div className="relative z-10 flex flex-col items-center text-center max-w-3xl mx-auto">
          <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-brand-purple/10 border border-brand-purple/20 text-brand-purple mb-8">
            <Sparkles className="w-4 h-4" />
            <span className="text-xs font-label-md tracking-widest uppercase font-semibold">Personalized AI Stylist</span>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold text-white tracking-tight mb-6 leading-tight">
            Curate Your Next Look
          </h1>
          
          <p className="text-lg md:text-xl text-slate-300 leading-relaxed mb-10 max-w-2xl">
            Our styling engine analyzes your entire collection alongside live environmental data to synthesize the perfect outfit for any occasion.
          </p>

          <div className="flex items-center gap-4 text-sm font-medium text-slate-400 bg-surface-2/50 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/5">
             <CloudSun className="w-5 h-5 text-brand-blue" />
             <span>Recommendations are automatically calibrated to your local weather.</span>
          </div>
        </div>
      </m.section>
      
      <div className="space-y-12">
        {/* ═══ SECTION 2: GENERATION WORKSPACE ═══ */}
        <m.section variants={fadeUp}>
          <OutfitGenerator />
        </m.section>

        {/* ═══ SECTION 5: RECOMMENDATION HISTORY ═══ */}
        <m.section variants={fadeUp}>
          <RecommendationHistory />
        </m.section>
      </div>
    </m.div>
  );
}
