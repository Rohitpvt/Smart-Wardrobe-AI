"use client";

import { ShieldCheck, ShieldAlert, Shield } from "lucide-react";

interface Props {
  confidence: number;
}

export function RecommendationConfidenceBadge({ confidence }: Props) {
  let label = "Experimental";
  let colorClass = "text-slate-400 bg-slate-400/10 border-slate-400/20";
  let Icon = ShieldAlert;

  if (confidence >= 90) {
    label = "Exceptional Match";
    colorClass = "text-emerald-400 bg-emerald-400/10 border-emerald-400/20";
    Icon = ShieldCheck;
  } else if (confidence >= 75) {
    label = "Strong Match";
    colorClass = "text-brand-blue bg-brand-blue/10 border-brand-blue/20";
    Icon = ShieldCheck;
  } else if (confidence >= 60) {
    label = "Good Match";
    colorClass = "text-amber-400 bg-amber-400/10 border-amber-400/20";
    Icon = Shield;
  }

  return (
    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border ${colorClass}`}>
      <Icon className="w-4 h-4" />
      <span className="text-xs font-semibold uppercase tracking-wider">{label}</span>
      <div className="w-px h-3 bg-current opacity-20 mx-1" />
      <span className="text-sm font-bold">{confidence}%</span>
    </div>
  );
}
