"use client";

import React from "react";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { TasteProfileResponse } from "@/types/dashboard";
import { User, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

interface TasteProfileCardProps {
  data: TasteProfileResponse;
}

export function TasteProfileCard({ data }: TasteProfileCardProps) {
  // Calculate stroke dasharray for the dial ring
  const circumference = 2 * Math.PI * 40;
  const strokeDashoffset = circumference - (data.personalization_score / 100) * circumference;

  return (
    <GlassPanel className="p-6 md:p-8 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">
      {/* Decorative Background */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-brand-purple/10 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none" />

      {/* Profile Info */}
      <div className="flex-1 space-y-4 z-10 text-center md:text-left">
        <div className="inline-flex items-center gap-2 bg-brand-purple/10 text-brand-purple px-3 py-1.5 rounded-lg border border-brand-purple/20">
          <User className="w-4 h-4" />
          <span className="text-xs font-label-md uppercase tracking-wider font-semibold">Taste Profile</span>
        </div>
        
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight mb-2">
            {data.profile_name}
          </h2>
          <p className="text-sm text-slate-300 leading-relaxed max-w-md">
            Based on your feedback and wear history, your personal stylist has learned your unique style DNA.
          </p>
        </div>

        <div className="flex items-center justify-center md:justify-start gap-4 pt-2">
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Profile Confidence: <strong className="text-slate-200">{data.confidence}%</strong></span>
          </div>
        </div>
      </div>

      {/* Personalization Score Dial */}
      <div className="relative shrink-0 w-32 h-32 flex items-center justify-center z-10 group">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
          {/* Background Ring */}
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="transparent"
            stroke="currentColor"
            strokeWidth="8"
            className="text-surface-2"
          />
          {/* Progress Ring */}
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="transparent"
            stroke="url(#purple-gradient)"
            strokeWidth="8"
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
          />
          <defs>
            <linearGradient id="purple-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#8b5cf6" />
              <stop offset="100%" stopColor="#3b82f6" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold text-white">{data.personalization_score}</span>
          <span className="text-[9px] uppercase tracking-widest text-slate-400 font-semibold mt-1">Score</span>
        </div>
      </div>
    </GlassPanel>
  );
}
