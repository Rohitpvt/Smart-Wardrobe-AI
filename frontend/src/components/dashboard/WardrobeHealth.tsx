"use client";

import React from "react";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { WardrobeHealthReport } from "@/types/dashboard";
import { ShieldAlert, ShieldCheck, PieChart, Layers, CheckCircle2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface WardrobeHealthProps {
  report: WardrobeHealthReport;
}

export function WardrobeHealth({ report }: WardrobeHealthProps) {
  const isHealthy = report.efficiency_score >= 70 && report.completeness_score >= 80;

  return (
    <GlassPanel className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-white">Wardrobe Health</h2>
          <p className="text-sm text-zinc-400">Analysis of gaps and composition.</p>
        </div>
        <div className={cn(
          "h-10 w-10 rounded-full flex items-center justify-center",
          isHealthy ? "bg-emerald-500/10" : "bg-amber-500/10"
        )}>
          {isHealthy ? (
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
          ) : (
            <ShieldAlert className="w-5 h-5 text-amber-400" />
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white/5 p-4 rounded-xl border border-white/5">
          <div className="flex items-center space-x-2 text-zinc-400 mb-2">
            <PieChart className="w-4 h-4" />
            <span className="text-sm">Efficiency Score</span>
          </div>
          <div className={cn(
            "text-2xl font-bold",
            report.efficiency_score >= 80 ? "text-emerald-400" :
            report.efficiency_score >= 60 ? "text-amber-400" : "text-red-400"
          )}>
            {report.efficiency_score}/100
          </div>
        </div>
        <div className="bg-white/5 p-4 rounded-xl border border-white/5">
          <div className="flex items-center space-x-2 text-zinc-400 mb-2">
            <Layers className="w-4 h-4" />
            <span className="text-sm">Completeness</span>
          </div>
          <div className={cn(
            "text-2xl font-bold",
            report.completeness_score >= 80 ? "text-emerald-400" :
            report.completeness_score >= 60 ? "text-amber-400" : "text-red-400"
          )}>
            {report.completeness_score}/100
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-medium text-white mb-2">Recommendations</h3>
          <ul className="space-y-2">
            {report.recommendations.map((rec, i) => (
              <li key={i} className="flex items-start space-x-2 text-sm">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                <span className="text-zinc-300">{rec}</span>
              </li>
            ))}
          </ul>
        </div>
        
        {report.gaps.length > 0 && (
          <div className="pt-2 border-t border-white/10">
            <h3 className="text-sm font-medium text-white mb-2">Identified Gaps</h3>
            <ul className="space-y-2">
              {report.gaps.map((gap, i) => (
                <li key={i} className="flex items-start space-x-2 text-sm">
                  <AlertCircle className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
                  <span className="text-zinc-300">{gap}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </GlassPanel>
  );
}
