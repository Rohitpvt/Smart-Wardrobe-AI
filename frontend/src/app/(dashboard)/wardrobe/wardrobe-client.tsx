"use client";

import { useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { PaginatedResponse, ClothingItem, WardrobeListParams } from "@/types/wardrobe";
import { useWardrobe } from "@/hooks/use-wardrobe";
import { useDashboard } from "@/hooks/use-dashboard";
import { ClothingGrid } from "@/components/wardrobe/clothing-grid";
import { SearchBar } from "@/components/wardrobe/search-bar";
import { FilterPanel } from "@/components/wardrobe/filter-panel";
import { SortDropdown } from "@/components/wardrobe/sort-dropdown";
import { Pagination } from "@/components/wardrobe/pagination";
import { m, Variants } from "framer-motion";
import { UploadCloud, Shirt, Layers, Tag, Sparkles } from "lucide-react";
import { toast } from "sonner";

import { fadeUp, staggerContainer as stagger } from "@/lib/animations";
import { KPIStatCard } from "@/components/dashboard/KPIStatCard";
import { GlassPanel } from "@/components/ui/GlassPanel";

export default function WardrobeClient() {
  const { params, query, actions, logWear } = useWardrobe();
  const { data, isLoading, error } = query;
  
  const { dashboard: dashboardQuery } = useDashboard();
  const { data: dashboardData, isLoading: dashboardLoading } = dashboardQuery;

  const getMostCommonCategory = () => {
    if (dashboardData?.category_distribution && dashboardData.category_distribution.length > 0) {
      const sorted = [...dashboardData.category_distribution].sort((a: {count: number}, b: {count: number}) => b.count - a.count);
      return sorted[0].name;
    }
    return "N/A";
  };

  const handleLogWear = (id: string) => {
    logWear.mutate(id, {
      onSuccess: () => toast.success("Wear logged successfully!"),
      onError: () => toast.error("Failed to log wear")
    });
  };

  return (
    <m.div initial="hidden" animate="visible" variants={stagger} className="space-y-8">
      {/* ═══ SECTION 1: HERO / HEADER ═══ */}
      <m.section
        variants={fadeUp}
        className="relative overflow-hidden rounded-2xl p-8 md:p-12 bg-surface-1/70 backdrop-blur-xl border border-white/10 shadow-[0_0_30px_rgba(59,130,246,0.05)]"
      >
        <div className="absolute top-0 right-0 w-72 h-72 bg-gradient-to-br from-brand-blue/20 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight mb-2">
              Wardrobe Studio
            </h1>
            <p className="text-lg text-slate-300 max-w-xl leading-relaxed">
              Manage your entire collection. Filter, search, and analyze your digital closet.
            </p>
          </div>
          <Link href="/wardrobe/upload" className="ds-btn-primary px-8 py-3.5 shadow-[0_0_30px_-5px_rgba(59,130,246,0.4)]">
            <UploadCloud className="w-5 h-5 mr-2" />
            Add New Item
          </Link>
        </div>
      </m.section>

      {/* ═══ SECTION 2: INSIGHTS STRIP ═══ */}
      <m.section variants={stagger} className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <KPIStatCard
          label="Total Items"
          value={dashboardLoading ? "..." : (dashboardData?.total_items || 0)}
          icon={Shirt}
          colorClass="text-blue-400"
          bgClass="bg-blue-500/15"
        />
        <KPIStatCard
          label="Categories"
          value={dashboardLoading ? "..." : (dashboardData?.categories || 0)}
          icon={Layers}
          colorClass="text-purple-400"
          bgClass="bg-purple-500/15"
        />
        <KPIStatCard
          label="Most Common"
          value={dashboardLoading ? "..." : getMostCommonCategory()}
          icon={Tag}
          colorClass="text-emerald-400"
          bgClass="bg-emerald-500/15"
        />
        <KPIStatCard
          label="Recently Added"
          value={dashboardLoading ? "..." : (dashboardData?.recent_items?.length || 0)}
          icon={Sparkles}
          colorClass="text-cyan-400"
          bgClass="bg-cyan-500/15"
        />
      </m.section>

      {/* ═══ SECTION 3: FILTER EXPERIENCE ═══ */}
      <m.div variants={fadeUp} className="flex flex-col lg:flex-row gap-4 lg:items-center bg-surface-1/70 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-lg">
        <div className="flex-1 min-w-[300px]">
          <SearchBar onSearch={actions.handleSearch} defaultValue={params.search} />
        </div>
        <div className="hidden lg:block w-px h-10 bg-white/10 mx-2" />
        <div className="flex flex-col sm:flex-row gap-4 justify-between lg:justify-end">
          <FilterPanel
            category={params.category || ""}
            season={params.season || ""}
            onCategoryChange={actions.handleCategoryChange}
            onSeasonChange={actions.handleSeasonChange}
          />
          <div className="hidden sm:block w-px h-10 bg-white/10 mx-2" />
          <SortDropdown
            sortBy={params.sort_by || "created_at"}
            sortOrder={params.sort_order || "desc"}
            onSortByChange={actions.handleSortByChange}
            onSortOrderChange={actions.handleSortOrderChange}
          />
        </div>
      </m.div>

      {/* ═══ SECTION 4: CLOTHING GRID ═══ */}
      <m.div variants={fadeUp} className="min-h-[500px]">
        {isLoading ? (
          <div className="columns-2 md:columns-3 lg:columns-4 xl:columns-5 gap-6 space-y-6">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="rounded-2xl border border-white/10 bg-surface-1/70 overflow-hidden shadow-sm animate-pulse break-inside-avoid">
                <div className="aspect-[3/4] bg-surface-2"></div>
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-white/10 rounded w-3/4"></div>
                  <div className="h-3 bg-white/10 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-24 text-center rounded-2xl bg-surface-1/70 border border-white/10 backdrop-blur-xl">
             <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center mb-4">
               <span className="text-red-400 text-2xl">!</span>
             </div>
             <h3 className="text-xl font-bold text-text-primary mb-2">Failed to load wardrobe</h3>
             <p className="text-text-secondary">Please check your connection and try again.</p>
          </div>
        ) : (
          <>
            <ClothingGrid items={data?.data || []} onLogWear={handleLogWear} />
            {data?.pagination && (
              <Pagination pagination={data.pagination} onPageChange={actions.handlePageChange} />
            )}
          </>
        )}
      </m.div>
    </m.div>
  );
}
