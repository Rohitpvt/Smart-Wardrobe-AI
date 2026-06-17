"use client";

import { useStyleMemory } from "@/hooks/use-style-memory";
import { m } from "framer-motion";
import { BrainCircuit, Loader2, Target, History, Sparkles } from "lucide-react";
import { fadeUp, staggerContainer as stagger } from "@/lib/animations";

function ConfidenceTierBadge({ tier, score }: { tier: string, score: number }) {
  let colorClass = "bg-slate-500/10 text-slate-400 border-slate-500/20";
  if (tier === "Highly Personalized Profile") colorClass = "bg-brand-purple/20 text-brand-purple border-brand-purple/30 shadow-[0_0_20px_rgba(139,92,246,0.3)]";
  else if (tier === "Established Profile") colorClass = "bg-brand-blue/20 text-brand-blue border-brand-blue/30 shadow-[0_0_15px_rgba(59,130,246,0.2)]";
  else if (tier === "Developing Profile") colorClass = "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";

  return (
    <div className={`px-4 py-2 rounded-full border flex items-center gap-2 ${colorClass}`}>
      <BrainCircuit className="w-4 h-4" />
      <span className="text-sm font-semibold">{tier} ({score}%)</span>
    </div>
  );
}

export default function StyleMemoryClient() {
  const { profileQuery } = useStyleMemory();

  if (profileQuery.isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-brand-blue" />
      </div>
    );
  }

  const profile = profileQuery.data;

  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center space-y-4">
        <BrainCircuit className="w-12 h-12 text-slate-500" />
        <h2 className="text-2xl font-bold text-white">Style Memory Not Available</h2>
        <p className="text-slate-400 max-w-md">Interact with more outfit recommendations to begin building your Style Memory Profile.</p>
      </div>
    );
  }

  return (
    <m.div initial="hidden" animate="visible" variants={stagger} className="max-w-7xl mx-auto space-y-8 pb-16">
      
      {/* ═══ HERO HEADER ═══ */}
      <m.section variants={fadeUp} className="relative overflow-hidden rounded-[2.5rem] p-10 md:p-12 bg-surface-1/70 backdrop-blur-xl border border-white/10 shadow-[0_0_50px_rgba(139,92,246,0.03)] group">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-gradient-to-br from-brand-purple/15 via-brand-blue/10 to-transparent rounded-full blur-[100px] -translate-y-1/2 translate-x-1/4 pointer-events-none group-hover:from-brand-purple/20 transition-all duration-1000" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div>
            <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-brand-purple/10 border border-brand-purple/20 text-brand-purple mb-6 inline-flex">
              <Sparkles className="w-4 h-4" />
              <span className="text-xs font-label-md tracking-widest uppercase font-semibold">Continuous Learning Engine</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight mb-4">
              Style Memory
            </h1>
            
            <p className="text-lg text-slate-300 max-w-xl">
              This workspace visualizes everything the AI has learned about your personal aesthetic based on your real-world feedback.
            </p>
          </div>

          <div className="bg-surface-2/80 backdrop-blur-md p-6 rounded-3xl border border-white/10 text-center space-y-3 min-w-[250px]">
            <p className="text-sm font-label-md text-slate-400 uppercase tracking-wider">Learning Confidence</p>
            <div className="flex justify-center">
              <ConfidenceTierBadge tier={profile.learning_tier} score={profile.confidence_score} />
            </div>
            <p className="text-xs text-slate-500">{profile.interaction_count} total interactions</p>
          </div>
        </div>
      </m.section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* ═══ RECENTLY LEARNED FEED ═══ */}
        <m.div variants={fadeUp} className="lg:col-span-1 space-y-6">
          <div className="bg-surface-1/70 border border-white/5 rounded-2xl p-6 shadow-lg h-full">
            <div className="flex items-center gap-3 mb-6">
              <History className="w-5 h-5 text-brand-blue" />
              <h2 className="text-xl font-semibold text-white">Recently Learned</h2>
            </div>
            
            <ul className="space-y-4">
              {profile.recently_learned_insights.map((insight, idx) => (
                <li key={idx} className="flex items-start gap-3 p-4 rounded-xl bg-white/5 border border-white/5">
                  <Target className="w-4 h-4 text-brand-purple shrink-0 mt-0.5" />
                  <span className="text-sm text-slate-300 leading-snug">{insight}</span>
                </li>
              ))}
              {profile.recently_learned_insights.length === 0 && (
                <li className="text-sm text-slate-500 text-center p-4">No recent insights available yet.</li>
              )}
            </ul>
          </div>
        </m.div>

        {/* ═══ PREFERENCES ═══ */}
        <m.div variants={fadeUp} className="lg:col-span-2 space-y-8">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-surface-1 border border-white/5 rounded-2xl p-6">
              <h3 className="text-sm font-label-md text-slate-500 uppercase tracking-wider mb-4">Favorite Colors</h3>
              <div className="flex flex-wrap gap-2">
                {profile.favorite_colors.map(color => (
                  <div key={color} className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-sm capitalize text-white">
                    {color}
                  </div>
                ))}
                {profile.favorite_colors.length === 0 && <span className="text-slate-500 text-sm">Learning...</span>}
              </div>
            </div>
            
            <div className="bg-surface-1 border border-white/5 rounded-2xl p-6">
              <h3 className="text-sm font-label-md text-slate-500 uppercase tracking-wider mb-4">Disliked Colors</h3>
              <div className="flex flex-wrap gap-2">
                {profile.disliked_colors.map(color => (
                  <div key={color} className="px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-sm capitalize text-red-300">
                    {color}
                  </div>
                ))}
                {profile.disliked_colors.length === 0 && <span className="text-slate-500 text-sm">None identified</span>}
              </div>
            </div>
          </div>

          <div className="bg-surface-1 border border-white/5 rounded-2xl p-6">
            <h3 className="text-sm font-label-md text-slate-500 uppercase tracking-wider mb-4">Favorite Categories</h3>
            <div className="flex flex-wrap gap-2">
              {profile.favorite_categories.map(cat => (
                <div key={cat} className="px-3 py-1.5 rounded-lg bg-brand-blue/10 border border-brand-blue/20 text-sm capitalize text-brand-blue font-medium">
                  {cat}
                </div>
              ))}
              {profile.favorite_categories.length === 0 && <span className="text-slate-500 text-sm">Learning...</span>}
            </div>
          </div>
          
          <div className="bg-surface-1 border border-white/5 rounded-2xl p-6 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-label-md text-slate-500 uppercase tracking-wider mb-1">Overall Formality Preference</h3>
              <p className="text-xs text-slate-400">Based on aggregate feedback trends</p>
            </div>
            <div className="px-4 py-2 rounded-xl bg-surface-2 border border-white/10 text-white font-semibold capitalize tracking-wide shadow-inner">
              {profile.preferred_style}
            </div>
          </div>

        </m.div>
      </div>

    </m.div>
  );
}
