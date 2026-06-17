"use client";

import React from "react";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { WearAnalyticsResponse } from "@/types/dashboard";
import { TrendingUp, TrendingDown, AlertTriangle, Palette, Layers } from "lucide-react";

interface WearAnalyticsCardProps {
  data: WearAnalyticsResponse;
}

export function WearAnalyticsCard({ data }: WearAnalyticsCardProps) {
  return (
    <GlassPanel className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-white">Wear Analytics</h2>
          <p className="text-sm text-zinc-400">Usage patterns across your wardrobe.</p>
        </div>
        <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center">
          <TrendingUp className="w-5 h-5 text-blue-400" />
        </div>
      </div>

      <div className="space-y-5">
        {/* Most Worn */}
        {data?.most_worn?.length > 0 && (
          <div>
            <div className="flex items-center space-x-2 text-zinc-400 mb-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <span className="text-sm font-medium">Most Worn</span>
            </div>
            <div className="space-y-1.5">
              {data.most_worn.slice(0, 3).map((item) => (
                <div
                  key={item?.id || Math.random().toString()}
                  className="flex items-center justify-between p-2 rounded-lg bg-white/5 border border-white/5"
                >
                  <span className="text-sm text-zinc-300 truncate max-w-[160px]">{item?.name || 'Unknown Item'}</span>
                  <span className="text-xs font-bold text-emerald-400">{item?.category || 'General'}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Underutilized */}
        {data?.underutilized_items?.length > 0 && (
          <div>
            <div className="flex items-center space-x-2 text-zinc-400 mb-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span className="text-sm font-medium">Underutilized ({data.underutilized_items.length})</span>
            </div>
            <div className="space-y-1.5">
              {data.underutilized_items.slice(0, 3).map((item) => (
                <div
                  key={item?.id || Math.random().toString()}
                  className="flex items-center justify-between p-2 rounded-lg bg-amber-500/5 border border-amber-500/10"
                >
                  <span className="text-sm text-zinc-300 truncate max-w-[160px]">{item?.name || 'Unknown Item'}</span>
                  <span className="text-xs text-amber-400">Needs wear</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Favorite Colors */}
        {data?.favorite_colors?.length > 0 && (
          <div>
            <div className="flex items-center space-x-2 text-zinc-400 mb-2">
              <Palette className="w-4 h-4 text-purple-400" />
              <span className="text-sm font-medium">Favorite Colors</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {data.favorite_colors.map((color) => (
                <div
                  key={color?.name || Math.random().toString()}
                  className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/5"
                >
                  <span
                    className="w-3 h-3 rounded-full border border-white/20"
                    style={{ backgroundColor: color?.name?.toLowerCase() || 'transparent' }}
                  />
                  <span className="text-xs text-zinc-300">{color?.name || 'Unknown'}</span>
                  <span className="text-[10px] text-zinc-500">({color?.count || 0})</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Favorite Categories */}
        {data?.favorite_categories?.length > 0 && (
          <div>
            <div className="flex items-center space-x-2 text-zinc-400 mb-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              <span className="text-sm font-medium">Top Categories</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {data.favorite_categories.map((cat) => (
                <span
                  key={cat?.name || Math.random().toString()}
                  className="px-3 py-1 rounded-lg bg-cyan-500/10 border border-cyan-500/15 text-xs text-cyan-300"
                >
                  {cat?.name || 'Unknown'} ({cat?.count || 0})
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </GlassPanel>
  );
}
