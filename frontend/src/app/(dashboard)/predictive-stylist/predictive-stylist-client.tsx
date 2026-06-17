"use client";

import { usePredictiveStylist } from "@/hooks/use-predictive-stylist";
import { getImageUrl } from "@/lib/image-url";
import { m } from "framer-motion";
import { fadeUp, staggerContainer as stagger } from "@/lib/animations";
import { Loader2, Telescope, Sparkles, TrendingUp, AlertTriangle, Layers, Shirt, Unlock } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { PredictiveInsight, UtilizationHeatmapData } from "@/types/predictive-stylist";
import { WidgetErrorBoundary } from "@/components/error-boundaries";

// Helpers
function getInsightIcon(type: string) {
  switch (type) {
    case 'underutilized_value': return <Sparkles className="w-5 h-5 text-amber-400" />;
    case 'neglected_items': return <AlertTriangle className="w-5 h-5 text-rose-400" />;
    case 'wardrobe_gap': return <Layers className="w-5 h-5 text-blue-400" />;
    case 'rotation_risk': return <TrendingUp className="w-5 h-5 text-orange-400" />;
    case 'outfit_unlock': return <Unlock className="w-5 h-5 text-emerald-400" />;
    default: return <Telescope className="w-5 h-5 text-brand-purple" />;
  }
}

// Subcomponents
function PredictiveInsightCard({ insight }: { insight: PredictiveInsight }) {
  return (
    <div className="bg-surface-1/70 backdrop-blur-xl border border-white/10 rounded-3xl p-8 relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-brand-purple/10 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none group-hover:from-brand-purple/20 transition-colors duration-700" />
      
      <div className="flex items-center gap-3 mb-6 relative z-10">
        <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/5">
          {getInsightIcon(insight.type)}
        </div>
        <div>
          <h3 className="text-sm font-label-md text-slate-400 uppercase tracking-wider">Top Priority Insight</h3>
          <p className="text-white font-medium capitalize">{insight.type.replace('_', ' ')}</p>
        </div>
      </div>

      <div className="space-y-6 relative z-10">
        <div>
          <p className="text-xl md:text-2xl font-bold text-white leading-tight mb-2">
            {insight.insight}
          </p>
          <p className="text-brand-blue font-medium">
            Why it matters: <span className="text-slate-300 font-normal">{insight.why_it_matters}</span>
          </p>
        </div>

        {insight.image_url && (
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5">
            <div className="w-16 h-16 rounded-xl bg-surface-2 relative overflow-hidden flex-shrink-0">
              {getImageUrl(insight.image_url) ? <Image src={getImageUrl(insight.image_url) as string} alt={insight.item_name || 'Item'} fill className="object-cover mix-blend-screen opacity-90" unoptimized /> : <div className="w-full h-full flex items-center justify-center bg-surface-2 opacity-50"><Shirt className="w-1/2 h-1/2 text-white/30"/></div>}
            </div>
            <div>
              <p className="text-sm font-medium text-white">{insight.item_name}</p>
              <p className="text-xs text-slate-400">{insight.category}</p>
            </div>
          </div>
        )}

        <div className="bg-brand-purple/10 border border-brand-purple/20 rounded-xl p-4">
          <p className="text-sm text-brand-purple font-medium flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-purple"></span>
            Recommended Action
          </p>
          <p className="text-sm text-slate-300 mt-1 pl-3.5">
            {insight.recommended_action}
          </p>
        </div>
      </div>
    </div>
  );
}

function SecondaryInsightList({ insights }: { insights: PredictiveInsight[] }) {
  if (!insights.length) return null;
  return (
    <div className="space-y-4">
      {insights.map((insight, idx) => (
        <div key={idx} className="bg-surface-1 border border-white/5 rounded-2xl p-5 flex gap-4 hover:border-white/10 transition-colors">
          <div className="mt-1">
            {getInsightIcon(insight.type)}
          </div>
          <div>
            <p className="text-base font-semibold text-white mb-1">{insight.insight}</p>
            <p className="text-sm text-slate-400 mb-3">{insight.why_it_matters}</p>
            <div className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-md bg-white/5 text-slate-300 border border-white/5">
              Action: {insight.recommended_action}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function UtilizationHeatmap({ data }: { data: UtilizationHeatmapData[] }) {
  if (!data || data.length === 0) return <div className="text-slate-500 text-sm p-4">No data available</div>;
  
  // Find max for scaling
  const maxWorn = Math.max(...(data || []).map(d => d.avg_worn || 0), 1);

  return (
    <div className="space-y-4 mt-2">
      {data.map((row, idx) => (
        <div key={idx}>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-slate-300 capitalize">{row.category}</span>
            <span className="text-slate-500">Avg {row.avg_worn.toFixed(1)} wears</span>
          </div>
          <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
            <div 
              className="h-full rounded-full bg-gradient-to-r from-brand-blue to-brand-purple"
              style={{ width: `${(row.avg_worn / maxWorn) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function PredictiveStylistClient() {
  const { insightsQuery, opportunitiesQuery, forecastQuery } = usePredictiveStylist();

  const isLoading = insightsQuery.isLoading || opportunitiesQuery.isLoading || forecastQuery.isLoading;

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-brand-purple" />
        <p className="text-slate-400 animate-pulse">Running predictive algorithms...</p>
      </div>
    );
  }

  const insightsRes = insightsQuery.data?.data;
  const oppsRes = opportunitiesQuery.data?.data;
  const forecastRes = forecastQuery.data?.data;

  // Empty state check
  if (!insightsRes?.top_priority_insight && (!oppsRes?.gaps.length && !oppsRes?.unlocks.length)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-brand-purple/10 flex items-center justify-center mb-2">
          <Telescope className="w-8 h-8 text-brand-purple" />
        </div>
        <h2 className="text-2xl font-bold text-white">Insufficient Data for Predictions</h2>
        <p className="text-slate-400 max-w-md">
          We need a more established wardrobe and more outfit interactions before the AI can accurately forecast issues and surface hidden value.
        </p>
        <Link 
          href="/dashboard/wardrobe"
          className="px-6 py-3 bg-brand-blue hover:bg-brand-blue/90 text-white rounded-xl font-medium transition-colors"
        >
          Manage Wardrobe
        </Link>
      </div>
    );
  }

  return (
    <m.div initial="hidden" animate="visible" variants={stagger} className="max-w-7xl mx-auto space-y-8 pb-16">
      
      {/* HEADER */}
      <m.div variants={fadeUp} className="flex flex-col md:flex-row md:items-end justify-between gap-6 relative z-10">
        <div>
          <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-brand-purple/10 border border-brand-purple/20 text-brand-purple mb-6 inline-flex">
            <Telescope className="w-4 h-4" />
            <span className="text-xs font-label-md tracking-widest uppercase font-semibold">Forward-Looking Intelligence</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight mb-3">Predictive Stylist</h1>
          <p className="text-lg text-slate-400 max-w-2xl">
            Anticipate wardrobe issues, identify hidden value, and discover exactly what you need to unlock new outfit combinations.
          </p>
        </div>
      </m.div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COL: PRIMARY INSIGHTS */}
        <div className="lg:col-span-8 space-y-8">
          {insightsRes?.top_priority_insight && (
            <m.div variants={fadeUp}>
              <WidgetErrorBoundary widgetName="PredictiveInsightCard" route="/predictive-stylist">
                <PredictiveInsightCard insight={insightsRes.top_priority_insight} />
              </WidgetErrorBoundary>
            </m.div>
          )}

          {insightsRes?.all_insights && insightsRes.all_insights.length > 1 && (
            <m.div variants={fadeUp} className="space-y-4">
              <h3 className="text-lg font-semibold text-white mb-4">Other Opportunities</h3>
              <WidgetErrorBoundary widgetName="SecondaryInsightList" route="/predictive-stylist">
                <SecondaryInsightList insights={(insightsRes?.all_insights || []).slice(1)} />
              </WidgetErrorBoundary>
            </m.div>
          )}
        </div>

        {/* RIGHT COL: FORECAST & HEATMAP */}
        <div className="lg:col-span-4 space-y-6">
          
          <m.div variants={fadeUp} className="bg-surface-1 border border-white/5 rounded-3xl p-6">
            <h3 className="text-sm font-label-md text-brand-blue uppercase tracking-wider mb-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Utilization Spread
            </h3>
            <WidgetErrorBoundary widgetName="UtilizationHeatmap" route="/predictive-stylist">
              <UtilizationHeatmap data={forecastRes?.heatmap_data || []} />
            </WidgetErrorBoundary>
          </m.div>

          {oppsRes?.gaps && oppsRes.gaps.length > 0 && (
            <m.div variants={fadeUp} className="bg-surface-1 border border-white/5 rounded-3xl p-6">
              <WidgetErrorBoundary widgetName="WardrobeGaps" route="/predictive-stylist">
                <h3 className="text-sm font-label-md text-slate-500 uppercase tracking-wider mb-4">Wardrobe Gaps</h3>
                <div className="space-y-4">
                  {(oppsRes?.gaps || []).slice(0, 2).map((gap, i) => (
                    <div key={i} className="pb-4 border-b border-white/5 last:border-0 last:pb-0">
                      <p className="text-sm font-medium text-white mb-1">{gap.insight}</p>
                      <p className="text-xs text-brand-blue">Action: {gap.recommended_action}</p>
                    </div>
                  ))}
                </div>
              </WidgetErrorBoundary>
            </m.div>
          )}

          {oppsRes?.unlocks && oppsRes.unlocks.length > 0 && (
            <m.div variants={fadeUp} className="bg-gradient-to-br from-emerald-500/10 to-transparent border border-emerald-500/20 rounded-3xl p-6">
              <WidgetErrorBoundary widgetName="OutfitUnlocks" route="/predictive-stylist">
                <h3 className="text-sm font-label-md text-emerald-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Unlock className="w-4 h-4" />
                  Outfit Unlocks
                </h3>
                <div className="space-y-4">
                  {(oppsRes?.unlocks || []).slice(0, 2).map((unlock, i) => (
                    <div key={i} className="pb-4 border-b border-white/5 last:border-0 last:pb-0">
                      <p className="text-sm font-medium text-white mb-1">{unlock.insight}</p>
                      <p className="text-xs text-slate-400 leading-relaxed">{unlock.why_it_matters}</p>
                    </div>
                  ))}
                </div>
              </WidgetErrorBoundary>
            </m.div>
          )}

        </div>

      </div>

    </m.div>
  );
}
