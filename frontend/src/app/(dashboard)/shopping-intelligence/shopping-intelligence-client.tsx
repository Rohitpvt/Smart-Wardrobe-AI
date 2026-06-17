"use client";

import { useShoppingIntelligence } from "@/hooks/use-shopping-intelligence";
import { m } from "framer-motion";
import { fadeUp, staggerContainer as stagger } from "@/lib/animations";
import { Loader2, ShoppingBag, Target, Unlock, TrendingUp, Sparkles, Heart, Shirt, Layers, CloudSun, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { ShoppingOpportunity, ROI_Breakdown } from "@/types/shopping-intelligence";
import { WidgetErrorBoundary } from "@/components/error-boundaries";

function getCategoryIcon(category: string) {
  const c = category.toLowerCase();
  if (c.includes('top')) return <Shirt className="w-8 h-8 text-white/50" />;
  if (c.includes('bottom')) return <Layers className="w-8 h-8 text-white/50" />;
  if (c.includes('footwear')) return <span className="text-3xl">👟</span>; // Fallback silhouette 
  if (c.includes('outerwear')) return <Shirt className="w-8 h-8 text-white/50" />;
  return <ShoppingBag className="w-8 h-8 text-white/50" />;
}

function OpportunityTypeBadge({ type }: { type: string }) {
  let config = { icon: Target, label: "Unknown", color: "text-slate-400 bg-slate-400/10 border-slate-400/20" };
  
  if (type === "essential_gap") config = { icon: AlertTriangle, label: "Essential Gap", color: "text-rose-400 bg-rose-400/10 border-rose-400/20" };
  else if (type === "high_outfit_unlock") config = { icon: Unlock, label: "High Unlock Potential", color: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20" };
  else if (type === "high_wardrobe_health_improvement") config = { icon: TrendingUp, label: "Health Upgrade", color: "text-blue-400 bg-blue-400/10 border-blue-400/20" };
  else if (type === "seasonal_need") config = { icon: CloudSun, label: "Seasonal Need", color: "text-amber-400 bg-amber-400/10 border-amber-400/20" };
  else if (type === "style_upgrade") config = { icon: Sparkles, label: "Style Upgrade", color: "text-brand-purple bg-brand-purple/10 border-brand-purple/20" };

  const Icon = config.icon;
  
  return (
    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-semibold tracking-wide uppercase ${config.color}`}>
      <Icon className="w-3 h-3" />
      {config.label}
    </div>
  );
}

function ShoppingOpportunityCard({ opp }: { opp: ShoppingOpportunity }) {
  return (
    <div className="bg-surface-1/70 backdrop-blur-xl border border-white/10 rounded-3xl p-6 relative overflow-hidden group hover:border-white/20 transition-colors">
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-brand-blue/5 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none group-hover:from-brand-blue/10 transition-colors duration-700" />
      
      {/* HEADER: AI Badge & Priority */}
      <div className="flex justify-between items-start mb-6 relative z-10">
        <OpportunityTypeBadge type={opp.opportunity_type} />
        <div className="flex items-center gap-1 bg-white/5 border border-white/10 px-2 py-1 rounded text-xs font-semibold text-white">
          <Sparkles className="w-3 h-3 text-brand-blue" />
          AI Upgrade
        </div>
      </div>

      {/* ITEM VISUALIZATION */}
      <div className="flex items-center gap-6 mb-8 relative z-10">
        <div className="w-24 h-24 rounded-2xl bg-surface-2 border border-white/5 flex items-center justify-center relative overflow-hidden shrink-0">
          {getCategoryIcon(opp.category)}
        </div>
        <div>
          <h3 className="text-xl font-bold text-white mb-2">{opp.item_name}</h3>
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-400 capitalize">{opp.category}</span>
            <div className="flex items-center gap-1.5 text-sm text-slate-300">
              <span className="w-3 h-3 rounded-full border border-white/20" style={{ backgroundColor: opp.color.toLowerCase() }}></span>
              {opp.color}
            </div>
          </div>
        </div>
      </div>

      {/* METRICS GRID */}
      <div className="grid grid-cols-3 gap-4 mb-8 relative z-10">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col items-center justify-center text-center">
          <div className="text-2xl font-bold text-brand-blue mb-1">{opp.roi_score}</div>
          <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">ROI Score</div>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col items-center justify-center text-center">
          <div className="text-2xl font-bold text-emerald-400 mb-1">+{opp.outfits_unlocked}</div>
          <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Outfits</div>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col items-center justify-center text-center">
          <div className="text-2xl font-bold text-brand-purple mb-1">{opp.style_compatibility}%</div>
          <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Style Match</div>
        </div>
      </div>

      {/* PURCHASE JUSTIFICATION */}
      <div className="space-y-4 relative z-10 border-t border-white/5 pt-6">
        <div>
          <h4 className="text-sm font-semibold text-white mb-1">Why This Item?</h4>
          <p className="text-sm text-slate-400 leading-relaxed">{opp.why_this_item}</p>
        </div>
        <div>
          <h4 className="text-sm font-semibold text-white mb-1">Expected Impact</h4>
          <p className="text-sm text-slate-400 leading-relaxed">{opp.expected_impact}</p>
        </div>
      </div>
    </div>
  );
}

export default function ShoppingIntelligenceClient() {
  const { opportunitiesQuery } = useShoppingIntelligence();

  if (opportunitiesQuery.isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-brand-blue" />
        <p className="text-slate-400 animate-pulse">Analyzing wardrobe ROI & unlocks...</p>
      </div>
    );
  }

  const oppsRes = opportunitiesQuery.data?.data;

  // Empty state protection
  if (!oppsRes || oppsRes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-brand-blue/10 flex items-center justify-center mb-2">
          <ShoppingBag className="w-8 h-8 text-brand-blue" />
        </div>
        <h2 className="text-2xl font-bold text-white">No Recommendations Yet</h2>
        <p className="text-slate-400 max-w-md">
          We need more wardrobe items to calculate meaningful ROI and outfit unlocks. Start digitizing your closet first!
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
          <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-brand-blue/10 border border-brand-blue/20 text-brand-blue mb-6 inline-flex">
            <ShoppingBag className="w-4 h-4" />
            <span className="text-xs font-label-md tracking-widest uppercase font-semibold">Strategic Wardrobe Growth</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight mb-3">Shopping Intelligence</h1>
          <p className="text-lg text-slate-400 max-w-2xl">
            Don't just buy clothes. Make strategic investments that mathematically unlock new outfits and improve your wardrobe health.
          </p>
        </div>
      </m.div>

      {/* TOP OPPORTUNITY (HERO) */}
      <m.div variants={fadeUp}>
        <WidgetErrorBoundary widgetName="ShoppingOpportunityCard (Hero)" route="/shopping-intelligence">
          <ShoppingOpportunityCard opp={oppsRes[0]} />
        </WidgetErrorBoundary>
      </m.div>

      {/* SECONDARY OPPORTUNITIES GRID */}
      {oppsRes.length > 1 && (
        <m.div variants={stagger} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {oppsRes.slice(1, 3).map((opp, idx) => (
            <m.div key={idx} variants={fadeUp}>
              <WidgetErrorBoundary widgetName={`ShoppingOpportunityCard (${idx + 1})`} route="/shopping-intelligence">
                <ShoppingOpportunityCard opp={opp} />
              </WidgetErrorBoundary>
            </m.div>
          ))}
        </m.div>
      )}

    </m.div>
  );
}
