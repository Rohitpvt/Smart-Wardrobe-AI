"use client";

import { DashboardSummary, DashboardTrend, RecentWardrobeItem } from "@/types/dashboard";
import { useDashboard } from "@/hooks/use-dashboard";
import { getImageUrl } from "@/lib/image-url";
import Link from "next/link";
import { PageHeaderSkeleton, StatsGridSkeleton, ChartSkeleton } from "@/components/ui/skeleton-loaders";
import Image from "next/image";
import dynamic from "next/dynamic";
import { useState } from "react";
import { m, AnimatePresence } from "framer-motion";
import { Shirt, UploadCloud, Wand2, BarChart3, Sparkles, Layers, TrendingUp, ChevronDown, ChevronUp } from "lucide-react";

const COLORS = ["#3b82f6", "#8b5cf6", "#adc6ff", "#d0bcff", "#10b981"];

import { fadeUp, staggerContainer as stagger } from "@/lib/animations";
import { KPIStatCard } from "@/components/dashboard/KPIStatCard";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { WardrobeHealth } from "@/components/dashboard/WardrobeHealth";
import { ClosetEconomics } from "@/components/dashboard/ClosetEconomics";
import { WearAnalyticsCard } from "@/components/dashboard/WearAnalyticsCard";
import { StyleDNACard } from "@/components/dashboard/StyleDNACard";
import { RotationInsightsCard } from "@/components/dashboard/RotationInsightsCard";
import { PurchaseRecommendationsCard } from "@/components/dashboard/PurchaseRecommendationsCard";
import { TasteProfileCard } from "@/components/dashboard/TasteProfileCard";
import { PreferenceInsightsCard } from "@/components/dashboard/PreferenceInsightsCard";
import { StyleEvolutionCard } from "@/components/dashboard/StyleEvolutionCard";
import { WardrobeIntelligenceCenter } from "@/components/dashboard/intelligence/WardrobeIntelligenceCenter";
import { ContextIntelligenceSection } from "@/components/dashboard/context/ContextIntelligenceSection";
import { DailyStylistWidget } from "@/components/dashboard/DailyStylistWidget";
import { RecentOutfitHistoryWidget } from "@/components/dashboard/RecentOutfitHistoryWidget";
import { WidgetErrorBoundary } from "@/components/error-boundaries";

const DashboardCharts = dynamic(() => import("@/components/dashboard/DashboardCharts"), {
  ssr: false,
  loading: () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <GlassPanel className="p-6 h-80 animate-pulse" />
      <GlassPanel className="p-6 h-80 animate-pulse" />
      <GlassPanel className="p-6 h-80 animate-pulse" />
      <GlassPanel className="p-6 h-80 animate-pulse" />
    </div>
  ),
});

export default function DashboardClient() {
  const { dashboard, trend, intelligence, analytics, purchaseRecs, predictive } = useDashboard();
  const { data, isLoading, error } = dashboard;
  const { data: trendData } = trend;
  const { data: intelData, isLoading: isIntelLoading } = intelligence;
  const { data: analyticsData } = analytics;
  const { data: purchaseRecsData } = purchaseRecs;
  const { data: predictiveData } = predictive;
  const { data: tasteProfileData } = useDashboard().tasteProfile;
  const [activeTab, setActiveTab] = useState<"predictive" | "personal" | "analytics">("predictive");

  /* ─── LOADING STATE ─── */
  if (isLoading) {
    return (
      <div className="space-y-8">
        <PageHeaderSkeleton />
        <StatsGridSkeleton count={4} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ChartSkeleton />
          <ChartSkeleton />
        </div>
      </div>
    );
  }

  /* ─── ERROR STATE ─── */
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center text-center py-24 rounded-2xl bg-surface-1/70 border border-white/10 backdrop-blur-xl">
        <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center mb-4">
          <span className="text-red-400 text-2xl">!</span>
        </div>
        <h3 className="text-xl font-bold text-text-primary mb-2">Failed to load dashboard</h3>
        <p className="text-text-secondary max-w-md">Please check your connection and try refreshing.</p>
      </div>
    );
  }

  /* ─── EMPTY STATE ─── */
  if (!data || data.total_items === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-center py-24 rounded-2xl bg-surface-1/70 border border-white/10 backdrop-blur-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-brand-blue/15 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none" />
        <div className="w-24 h-24 mb-6 text-brand-blue/20">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20.38 3.46L16 2a4 4 0 01-8 0L3.62 3.46a2 2 0 00-1.34 2.23l.58 3.47a1 1 0 00.99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 002-2V10h2.15a1 1 0 00.99-.84l.58-3.47a2 2 0 00-1.34-2.23z" />
          </svg>
        </div>
        <h3 className="text-2xl font-bold text-text-primary mb-2">Your wardrobe is empty</h3>
        <p className="text-text-secondary max-w-md mb-8">Start digitizing your closet to unlock AI-powered insights and outfit recommendations.</p>
        <Link href="/wardrobe/upload" className="ds-btn-primary text-base px-8 py-4 shadow-[0_0_40px_-10px_rgba(59,130,246,0.5)]">
          <UploadCloud className="w-5 h-5 mr-2" />
          Upload Your First Item
        </Link>
      </div>
    );
  }

  /* ─── MAIN DASHBOARD ─── */
  const kpis = [
    { label: "Total Items", value: data.total_items, icon: Shirt, color: "text-blue-400", bg: "bg-blue-500/15" },
    { label: "Categories", value: data.categories, icon: Layers, color: "text-purple-400", bg: "bg-purple-500/15" },
    { label: "Brands", value: data.unique_brands, icon: Sparkles, color: "text-emerald-400", bg: "bg-emerald-500/15" },
    { label: "AI Coverage", value: `${data.health_metrics.ai_coverage_percentage}%`, icon: TrendingUp, color: "text-cyan-400", bg: "bg-cyan-500/15" },
  ];

  return (
    <m.div initial="hidden" animate="visible" variants={stagger} className="space-y-8">

      {/* ═══ SECTION 1: WELCOME BANNER ═══ */}
      <m.section
        variants={fadeUp}
        className="relative overflow-hidden rounded-2xl p-8 md:p-12 bg-surface-1/70 backdrop-blur-xl border border-white/10 shadow-[0_0_30px_rgba(59,130,246,0.05)]"
      >
        <div className="absolute top-0 right-0 w-72 h-72 bg-gradient-to-br from-brand-blue/20 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight mb-2">
              Welcome back.
            </h1>
            <p className="text-lg text-slate-300 max-w-xl leading-relaxed">
              Your wardrobe intelligence is synchronized. {data.total_items} items across {data.categories} categories are ready for AI-powered styling.
            </p>
          </div>
          <div className="flex gap-3">
            <Link href="/wardrobe/upload" className="ds-btn-primary px-5 py-3 text-sm">
              <UploadCloud className="w-4 h-4 mr-2" /> Upload
            </Link>
            <Link href="/recommendations" className="ds-btn-secondary px-5 py-3 text-sm">
              <Wand2 className="w-4 h-4 mr-2" /> Generate Outfit
            </Link>
          </div>
        </div>
      </m.section>

      {/* ═══ SECTION 1.2: DAILY STYLIST WIDGET ═══ */}
      <WidgetErrorBoundary widgetName="DailyStylistWidget" route="/dashboard">
        <DailyStylistWidget />
      </WidgetErrorBoundary>

      {/* ═══ SECTION 1.3: RECENT OUTFIT HISTORY ═══ */}
      <WidgetErrorBoundary widgetName="RecentOutfitHistoryWidget" route="/dashboard">
        <RecentOutfitHistoryWidget />
      </WidgetErrorBoundary>

      {/* ═══ SECTION 1.5: WARDROBE INTELLIGENCE CENTER (Phase 8A) ═══ */}
      <WidgetErrorBoundary widgetName="WardrobeIntelligenceCenter" route="/dashboard">
        <WardrobeIntelligenceCenter />
      </WidgetErrorBoundary>

      {/* ═══ SECTION 1.6: CONTEXT INTELLIGENCE SECTION (Phase 8B) ═══ */}
      <WidgetErrorBoundary widgetName="ContextIntelligenceSection" route="/dashboard">
        <ContextIntelligenceSection />
      </WidgetErrorBoundary>

      {/* ═══ SECTION 2: KPI CARDS ═══ */}
      <m.section variants={stagger} className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {kpis.map((kpi, i) => (
          <KPIStatCard key={i} {...kpi} colorClass={kpi.color} bgClass={kpi.bg} />
        ))}
      </m.section>

      {/* ═══ SECTION 2.5: INTELLIGENCE METRICS ═══ */}
      {intelData && !isIntelLoading && (
        <m.section variants={stagger} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <m.div variants={fadeUp}>
            <WidgetErrorBoundary widgetName="WardrobeHealth" route="/dashboard">
              <WardrobeHealth />
            </WidgetErrorBoundary>
          </m.div>
          <m.div variants={fadeUp}>
            <WidgetErrorBoundary widgetName="ClosetEconomics" route="/dashboard">
              <ClosetEconomics stats={intelData.economics} />
            </WidgetErrorBoundary>
          </m.div>
        </m.section>
      )}

      {/* ═══ SECTION 2.6: TIERED INSIGHTS TABS ═══ */}
      <m.div variants={fadeUp} className="mt-8 border-b border-white/10 flex gap-6 pb-2">
        {(["predictive", "personal", "analytics"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`text-lg font-medium transition-colors ${activeTab === tab ? "text-brand-blue" : "text-slate-400 hover:text-white"}`}
          >
            {tab === "predictive" ? "Predictive Insights" : tab === "personal" ? "Personal Stylist" : "Historical Analytics"}
          </button>
        ))}
      </m.div>

      <AnimatePresence mode="wait">
        <m.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {/* TAB: PREDICTIVE INSIGHTS */}
          {activeTab === "predictive" && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 pt-6">
              {predictiveData?.style_dna && (
                <WidgetErrorBoundary widgetName="StyleDNACard" route="/dashboard">
                  <StyleDNACard data={predictiveData.style_dna} />
                </WidgetErrorBoundary>
              )}
              {predictiveData?.rotation && (
                <WidgetErrorBoundary widgetName="RotationInsightsCard" route="/dashboard">
                  <RotationInsightsCard data={predictiveData.rotation} />
                </WidgetErrorBoundary>
              )}
              {purchaseRecsData && (
                <WidgetErrorBoundary widgetName="PurchaseRecommendationsCard" route="/dashboard">
                  <PurchaseRecommendationsCard data={purchaseRecsData} />
                </WidgetErrorBoundary>
              )}
            </div>
          )}

          {/* TAB: PERSONAL STYLIST */}
          {activeTab === "personal" && tasteProfileData && (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pt-6">
              <div className="md:col-span-12 xl:col-span-5">
                <WidgetErrorBoundary widgetName="TasteProfileCard" route="/dashboard">
                  <TasteProfileCard data={tasteProfileData} />
                </WidgetErrorBoundary>
              </div>
              <div className="md:col-span-6 xl:col-span-4">
                <WidgetErrorBoundary widgetName="PreferenceInsightsCard" route="/dashboard">
                  <PreferenceInsightsCard data={tasteProfileData} />
                </WidgetErrorBoundary>
              </div>
              <div className="md:col-span-6 xl:col-span-3">
                <WidgetErrorBoundary widgetName="StyleEvolutionCard" route="/dashboard">
                  <StyleEvolutionCard data={tasteProfileData} />
                </WidgetErrorBoundary>
              </div>
            </div>
          )}

          {/* TAB: HISTORICAL ANALYTICS */}
          {activeTab === "analytics" && (
            <div className="space-y-6 pt-6">
              {analyticsData && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <WidgetErrorBoundary widgetName="WearAnalyticsCard" route="/dashboard">
                    <WearAnalyticsCard data={analyticsData} />
                  </WidgetErrorBoundary>
                </div>
              )}
              <WidgetErrorBoundary widgetName="DashboardCharts" route="/dashboard">
                <DashboardCharts data={data} trendData={trendData} />
              </WidgetErrorBoundary>
            </div>
          )}
        </m.div>
      </AnimatePresence>

      {/* ═══ SECTION 4: RECENT ADDITIONS ═══ */}
      <m.div variants={fadeUp}>
        <div className="flex items-center justify-between mb-6 mt-4">
          <h2 className="text-2xl font-semibold text-white tracking-tight">Recent Acquisitions</h2>
          <Link href="/wardrobe" className="text-sm font-medium text-brand-blue hover:text-blue-400 transition-colors flex items-center gap-1">
            View All <span className="text-base">→</span>
          </Link>
        </div>
      </m.div>

      <m.section variants={stagger} className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {data.recent_items.map((item: RecentWardrobeItem, i: number) => (
          <m.div
            key={item.id}
            variants={fadeUp}
            className="group rounded-2xl overflow-hidden bg-surface-1/70 backdrop-blur-xl border border-white/10 hover:border-white/15 hover:-translate-y-[2px] hover:shadow-[0_0_40px_rgba(59,130,246,0.1)] transition-all duration-300"
          >
            <div className="aspect-[3/4] bg-surface-2 relative overflow-hidden">
              {getImageUrl(item.image_url) && (
          <Image
            src={getImageUrl(item.image_url) as string}
                  alt={item.name}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 20vw"
                  unoptimized={true}
                  className="object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
            <div className="p-4 border-t border-white/5">
              <h4 className="text-sm font-semibold truncate text-white mb-1">{item.name}</h4>
              <p className="text-xs text-slate-400 tracking-wide">{item.category}</p>
            </div>
          </m.div>
        ))}
      </m.section>

      {/* ═══ SECTION 5: QUICK ACTIONS ═══ */}
      <m.section variants={fadeUp} className="mt-4">
        <h2 className="text-2xl font-semibold text-white tracking-tight mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[
            { label: "Upload Item", desc: "Add a new piece to your digital wardrobe", icon: UploadCloud, href: "/wardrobe/upload", color: "from-blue-500/15 to-transparent" },
            { label: "Generate Outfit", desc: "Let AI craft a perfect look for today", icon: Wand2, href: "/recommendations", color: "from-purple-500/15 to-transparent" },
            { label: "View Wardrobe", desc: "Browse your complete clothing collection", icon: BarChart3, href: "/wardrobe", color: "from-emerald-500/15 to-transparent" },
          ].map((action, i) => (
            <Link
              key={i}
              href={action.href}
              className="group rounded-2xl p-6 bg-surface-1/70 backdrop-blur-xl border border-white/10 hover:border-white/15 hover:-translate-y-[2px] hover:shadow-[0_0_40px_rgba(59,130,246,0.1)] transition-all duration-300 flex flex-col relative overflow-hidden"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${action.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
              <div className="relative z-10">
                <action.icon className="w-8 h-8 text-text-secondary mb-4 group-hover:text-white transition-colors" />
                <h3 className="text-lg font-semibold text-white mb-1">{action.label}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{action.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </m.section>

      {/* Bottom Spacer */}
      <div className="h-8" />
    </m.div>
  );
}
