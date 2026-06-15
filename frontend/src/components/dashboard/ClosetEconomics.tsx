"use client";

import React from "react";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { CostPerWearStats } from "@/types/dashboard";
import { TrendingDown, TrendingUp, DollarSign, Activity } from "lucide-react";

interface ClosetEconomicsProps {
  stats: CostPerWearStats;
}

export function ClosetEconomics({ stats }: ClosetEconomicsProps) {
  return (
    <GlassPanel className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-white">Closet Economics</h2>
          <p className="text-sm text-zinc-400">Track the value and utility of your wardrobe.</p>
        </div>
        <div className="h-10 w-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
          <DollarSign className="w-5 h-5 text-emerald-400" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white/5 p-4 rounded-xl border border-white/5">
          <div className="flex items-center space-x-2 text-zinc-400 mb-2">
            <Activity className="w-4 h-4" />
            <span className="text-sm">Avg Cost/Wear</span>
          </div>
          <div className="text-2xl font-bold text-white">
            ${stats.average_cost_per_wear.toFixed(2)}
          </div>
        </div>
        <div className="bg-white/5 p-4 rounded-xl border border-white/5">
          <div className="flex items-center space-x-2 text-zinc-400 mb-2">
            <DollarSign className="w-4 h-4" />
            <span className="text-sm">Total Value</span>
          </div>
          <div className="text-2xl font-bold text-white">
            ${stats.total_investment.toFixed(0)}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {stats.most_valuable_item && (
          <div className="flex items-center justify-between p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
            <div className="flex items-center space-x-3">
              <div className="h-8 w-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
                <TrendingDown className="w-4 h-4 text-emerald-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-emerald-300">Most Valuable</p>
                <p className="text-xs text-zinc-400 truncate max-w-[150px]">{stats.most_valuable_item.name}</p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-sm font-bold text-emerald-400">Highest ROI</span>
            </div>
          </div>
        )}

        {stats.least_utilized_item && (
          <div className="flex items-center justify-between p-3 rounded-lg bg-red-500/5 border border-red-500/10">
            <div className="flex items-center space-x-3">
              <div className="h-8 w-8 rounded-full bg-red-500/20 flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-red-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-red-300">Least Utilized</p>
                <p className="text-xs text-zinc-400 truncate max-w-[150px]">{stats.least_utilized_item.name}</p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-sm font-bold text-red-400">Needs Wear</span>
            </div>
          </div>
        )}
      </div>
    </GlassPanel>
  );
}
