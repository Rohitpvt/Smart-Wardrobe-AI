"use client";

import React from "react";
import { useWardrobeHealth } from "@/hooks/use-intelligence";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { ShieldCheck, ShieldAlert, TrendingUp, TrendingDown, ArrowRight, Activity, Loader2 } from "lucide-react";
import { m } from "framer-motion";
import { cn } from "@/lib/utils";

export function WardrobeHealth() {
  const { data: health, isLoading } = useWardrobeHealth();

  if (isLoading) {
    return (
      <GlassPanel className="p-6 h-full min-h-[400px] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-brand-purple" />
      </GlassPanel>
    );
  }

  if (!health) return null;

  // Empty State
  if (health.overall_score === 0) {
    return (
      <GlassPanel className="p-8 h-full flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 rounded-full bg-brand-purple/10 flex items-center justify-center mb-4">
          <ShieldAlert className="w-8 h-8 text-brand-purple" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">Wardrobe Health</h3>
        <p className="text-slate-400 mb-6 max-w-sm">
          {health.top_improvement}
        </p>
      </GlassPanel>
    );
  }

  const isHealthy = health.overall_score >= 70;
  
  const subscores = [
    { label: "Utilization Health", value: health.utilization_health },
    { label: "Coverage Health", value: health.coverage_health },
    { label: "Style Alignment", value: health.style_alignment },
    { label: "Recommendation Effectiveness", value: health.recommendation_effectiveness },
    { label: "Financial Efficiency", value: health.financial_efficiency },
    { label: "Future Readiness", value: health.future_readiness },
  ];

  return (
    <GlassPanel className="p-6 h-full flex flex-col">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            {isHealthy ? <ShieldCheck className="w-5 h-5 text-emerald-400" /> : <ShieldAlert className="w-5 h-5 text-amber-400" />}
            Wardrobe Health
          </h2>
          <p className="text-sm text-slate-400 mt-1">Cross-domain intelligence score</p>
        </div>
        
        {/* Grade Badge */}
        <div className={cn(
          "px-4 py-2 rounded-xl border text-xl font-black shadow-lg",
          health.grade.startsWith("A") ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" :
          health.grade.startsWith("B") ? "bg-blue-500/10 border-blue-500/30 text-blue-400" :
          health.grade.startsWith("C") ? "bg-amber-500/10 border-amber-500/30 text-amber-400" :
          "bg-rose-500/10 border-rose-500/30 text-rose-400"
        )}>
          {health.grade}
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-8 mb-8">
        {/* Score Ring Hero */}
        <div className="flex-shrink-0 flex flex-col items-center justify-center">
          <div className="relative w-32 h-32 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
              <circle 
                cx="50" 
                cy="50" 
                r="45" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="8" 
                strokeDasharray={`${health.overall_score * 2.827} 282.7`} 
                strokeLinecap="round"
                className={cn(
                  isHealthy ? "text-emerald-400" : "text-amber-400"
                )}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl font-black text-white">{health.overall_score}</span>
            </div>
          </div>
          
          {/* Trend Indicator */}
          {health.score_delta !== 0 && (
            <div className={cn(
              "mt-3 flex items-center gap-1 text-sm font-bold",
              health.score_delta > 0 ? "text-emerald-400" : "text-rose-400"
            )}>
              {health.score_delta > 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              {health.score_delta > 0 ? "+" : ""}{health.score_delta} pts
            </div>
          )}
        </div>

        {/* Breakdown Bars */}
        <div className="flex-1 space-y-3">
          {subscores.map((score, i) => (
            <div key={i} className="space-y-1">
              <div className="flex justify-between text-xs font-medium">
                <span className="text-slate-300">{score.label}</span>
                <span className="text-slate-400">{score.value}/100</span>
              </div>
              <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                <m.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${score.value}%` }}
                  transition={{ duration: 1, delay: i * 0.1 }}
                  className={cn(
                    "h-full rounded-full",
                    score.value >= 80 ? "bg-emerald-400" : 
                    score.value >= 60 ? "bg-brand-blue" : "bg-amber-400"
                  )}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Improvement Center */}
      <div className="bg-gradient-to-br from-surface-2 to-surface-1 border border-white/5 rounded-2xl p-5 mt-auto">
        <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
          <Activity className="w-4 h-4 text-brand-purple" />
          Improvement Center
        </h3>
        
        <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
          <div className="bg-white/5 rounded-xl p-3 border border-white/5">
            <span className="block text-xs text-slate-500 mb-1 uppercase tracking-wider">Strongest</span>
            <span className="font-semibold text-emerald-400">{health.strongest_area}</span>
          </div>
          <div className="bg-white/5 rounded-xl p-3 border border-white/5">
            <span className="block text-xs text-slate-500 mb-1 uppercase tracking-wider">Weakest</span>
            <span className="font-semibold text-rose-400">{health.weakest_area}</span>
          </div>
        </div>

        <div className="bg-brand-purple/10 border border-brand-purple/20 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="text-sm text-slate-200">
            <span className="font-bold text-brand-purple block mb-1">Recommended Action</span>
            {health.top_improvement}
          </div>
          
          {/* Health Forecast */}
          <div className="flex-shrink-0 bg-surface-2 border border-white/10 rounded-lg px-3 py-2 flex items-center gap-3 shadow-inner">
            <div className="text-center">
              <span className="block text-[10px] text-slate-500 uppercase tracking-widest mb-0.5">Current</span>
              <span className="text-lg font-bold text-white">{health.overall_score}</span>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-600" />
            <div className="text-center">
              <span className="block text-[10px] text-brand-purple uppercase tracking-widest mb-0.5">Forecast</span>
              <span className="text-lg font-bold text-brand-purple">
                {Math.min(100, health.overall_score + health.projected_score_gain)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </GlassPanel>
  );
}
