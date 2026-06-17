"use client";

import { useWearTracking } from "@/hooks/use-wear-tracking";
import { m } from "framer-motion";
import { fadeUp, staggerContainer as stagger } from "@/lib/animations";
import { Loader2, History, AlertTriangle, TrendingDown, TrendingUp, Calendar as CalendarIcon, Tag, Zap } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { format, parseISO, subDays } from "date-fns";
import { WearGroup, HeatmapData, RepetitionWarning, CostPerWearMetric } from "@/types/wear-tracking";

// SUBCOMPONENTS

function WearTimelineCard({ group }: { group: WearGroup }) {
  return (
    <div className="bg-surface-1/70 backdrop-blur-xl border border-white/5 hover:border-white/10 transition-colors rounded-3xl p-6 relative overflow-hidden group">
      <div className="flex justify-between items-start mb-6 border-b border-white/5 pb-4">
        <div>
          <h3 className="text-lg font-bold text-white">
            {format(parseISO(group.worn_at), "EEEE, MMMM do")}
          </h3>
          <p className="text-sm text-slate-400 mt-1">
            {format(parseISO(group.worn_at), "h:mm a")} • {group.source_type.replace('_', ' ')}
          </p>
        </div>
        {group.occasion && (
          <div className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs font-medium text-brand-blue uppercase tracking-wider">
            {group.occasion}
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-4">
        {group.items.map((item) => (
          <div key={item.id} className="flex items-center gap-3 bg-white/5 rounded-xl p-2 pr-4">
            <div className="w-12 h-12 rounded-lg bg-surface-2 relative overflow-hidden flex-shrink-0">
              {item.image_url ? (
                <Image src={item.image_url} alt={item.name} fill className="object-cover mix-blend-screen opacity-90" unoptimized />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xs text-slate-500">Item</div>
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-white">{item.name}</p>
              <p className="text-xs text-slate-400 capitalize">{item.category}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function UsageHeatmap({ data }: { data: HeatmapData[] }) {
  // Simple github-style contribution graph logic
  const days = 90; // Last 90 days
  const today = new Date();
  
  const mapData = new Map(data.map(d => [d.date.split('T')[0], d.count]));
  
  const boxes = Array.from({ length: days }).map((_, i) => {
    const d = subDays(today, days - 1 - i);
    const dateStr = format(d, "yyyy-MM-dd");
    const count = mapData.get(dateStr) || 0;
    return { date: dateStr, count };
  });

  return (
    <div className="bg-surface-1 border border-white/5 rounded-3xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-sm font-label-md text-white uppercase tracking-wider flex items-center gap-2">
          <CalendarIcon className="w-4 h-4 text-brand-purple" />
          Wear Activity (90 Days)
        </h3>
      </div>
      
      <div className="flex gap-1 overflow-x-auto pb-2">
        {/* Simple grid approach instead of complex column nesting for this demo */}
        <div className="grid grid-rows-7 grid-flow-col gap-1">
          {boxes.map((box, i) => {
            let color = "bg-white/5";
            if (box.count === 1) color = "bg-brand-purple/20";
            else if (box.count === 2) color = "bg-brand-purple/40";
            else if (box.count >= 3) color = "bg-brand-purple/70";
            
            return (
              <div 
                key={i} 
                className={`w-3 h-3 rounded-sm ${color} transition-colors hover:border hover:border-white/50`}
                title={`${box.date}: ${box.count} items worn`}
              />
            )
          })}
        </div>
      </div>
    </div>
  );
}

function CostPerWearList({ items, title, icon: Icon, colorClass }: { items: CostPerWearMetric[], title: string, icon: any, colorClass: string }) {
  if (!items.length) return null;
  return (
    <div className="space-y-4">
      <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
        <Icon className={`w-4 h-4 ${colorClass}`} />
        {title}
      </h4>
      <div className="space-y-3">
        {items.map(item => (
          <div key={item.item_id} className="flex justify-between items-center bg-white/5 rounded-xl p-3">
            <div>
              <p className="text-sm font-medium text-white">{item.name}</p>
              <p className="text-xs text-slate-400">{item.worn_count} wears</p>
            </div>
            <div className={`text-sm font-bold ${colorClass}`}>
              ${item.cpw.toFixed(2)}/wear
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function OutfitHistoryClient() {
  const { historyQuery, analyticsQuery, repetitionQuery } = useWearTracking();

  const isLoading = historyQuery.isLoading || analyticsQuery.isLoading || repetitionQuery.isLoading;

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-brand-purple" />
        <p className="text-slate-400 animate-pulse">Reconstructing behavioral history...</p>
      </div>
    );
  }

  const history = historyQuery.data?.data || [];
  const analytics = analyticsQuery.data?.data;
  const repetition = repetitionQuery.data?.data;

  if (!history.length) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-brand-purple/10 flex items-center justify-center mb-2">
          <History className="w-8 h-8 text-brand-purple" />
        </div>
        <h2 className="text-2xl font-bold text-white">No History Available</h2>
        <p className="text-slate-400 max-w-md">
          Start wearing outfits and logging them to unlock historical insights, cost-per-wear tracking, and repetition analytics.
        </p>
        <Link 
          href="/dashboard/daily-stylist"
          className="px-6 py-3 bg-brand-purple hover:bg-brand-purple/90 text-white rounded-xl font-medium transition-colors"
        >
          Get Dressed
        </Link>
      </div>
    );
  }

  return (
    <m.div initial="hidden" animate="visible" variants={stagger} className="max-w-7xl mx-auto space-y-8 pb-16">
      
      {/* HEADER */}
      <m.div variants={fadeUp} className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-brand-purple/10 border border-brand-purple/20 text-brand-purple mb-6 inline-flex">
            <History className="w-4 h-4" />
            <span className="text-xs font-label-md tracking-widest uppercase font-semibold">Behavioral Record</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight mb-3">Outfit History</h1>
          <p className="text-lg text-slate-400 max-w-2xl">
            A chronological timeline of your style behavior. Review your usage patterns, discover cost-per-wear metrics, and avoid over-rotation.
          </p>
        </div>
      </m.div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COL: TIMELINE */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-6">
          <m.div variants={fadeUp} className="flex items-center gap-2 mb-2">
            <h2 className="text-xl font-bold text-white">Timeline</h2>
            <span className="px-2 py-0.5 rounded-full bg-white/10 text-xs text-slate-300 font-medium">{history.length} recent</span>
          </m.div>

          <div className="space-y-4">
            {history.map((group, idx) => (
              <m.div key={group.wear_group_id} variants={fadeUp}>
                <WearTimelineCard group={group} />
              </m.div>
            ))}
          </div>
        </div>

        {/* RIGHT COL: INSIGHTS & ANALYTICS */}
        <div className="lg:col-span-5 xl:col-span-4 space-y-6">
          
          <m.div variants={fadeUp}>
            <UsageHeatmap data={analytics?.heatmap || []} />
          </m.div>

          {repetition?.repetition_warnings && repetition.repetition_warnings.length > 0 && (
            <m.div variants={fadeUp} className="bg-gradient-to-br from-rose-500/10 to-transparent border border-rose-500/20 rounded-3xl p-6">
              <h3 className="text-sm font-label-md text-rose-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Over-rotation Warnings
              </h3>
              <div className="space-y-4">
                {repetition.repetition_warnings.map((warn: RepetitionWarning, i: number) => (
                  <div key={i} className="flex gap-3 pb-3 border-b border-rose-500/10 last:border-0 last:pb-0">
                    <div className="w-10 h-10 rounded-lg bg-surface-2 relative overflow-hidden flex-shrink-0 border border-rose-500/20">
                      {warn.image_url && <Image src={warn.image_url} alt="Item" fill className="object-cover opacity-80" unoptimized />}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{warn.item_name}</p>
                      <p className="text-xs text-rose-300/80">{warn.warning}</p>
                    </div>
                  </div>
                ))}
              </div>
            </m.div>
          )}

          {repetition?.cost_per_wear && (
            <m.div variants={fadeUp} className="bg-surface-1 border border-white/5 rounded-3xl p-6">
              <h3 className="text-sm font-label-md text-white uppercase tracking-wider mb-6 flex items-center gap-2">
                <Tag className="w-4 h-4 text-emerald-400" />
                Cost Per Wear
              </h3>
              
              <div className="space-y-6">
                <CostPerWearList 
                  items={repetition.cost_per_wear.best_value} 
                  title="Best Value (Lowest CPW)" 
                  icon={TrendingDown} 
                  colorClass="text-emerald-400" 
                />
                
                <CostPerWearList 
                  items={repetition.cost_per_wear.worst_value} 
                  title="Worst Value (Highest CPW)" 
                  icon={TrendingUp} 
                  colorClass="text-rose-400" 
                />
              </div>
            </m.div>
          )}

        </div>

      </div>

    </m.div>
  );
}
