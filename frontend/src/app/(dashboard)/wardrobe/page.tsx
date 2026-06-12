"use client";

import { useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { api } from "@/lib/axios";
import { PaginatedResponse, ClothingItem, WardrobeListParams } from "@/types/wardrobe";
import { ClothingGrid } from "@/components/wardrobe/clothing-grid";
import { SearchBar } from "@/components/wardrobe/search-bar";
import { FilterPanel } from "@/components/wardrobe/filter-panel";
import { SortDropdown } from "@/components/wardrobe/sort-dropdown";
import { Pagination } from "@/components/wardrobe/pagination";

export default function WardrobePage() {
  const [params, setParams] = useState<WardrobeListParams>({
    page: 1,
    page_size: 20,
    search: "",
    category: "",
    season: "",
    sort_by: "created_at",
    sort_order: "desc",
  });

  const { data, isLoading, error } = useQuery({
    queryKey: ["wardrobe", params],
    queryFn: async () => {
      const cleanParams: Record<string, string | number> = {};
      if (params.page) cleanParams.page = params.page;
      if (params.page_size) cleanParams.page_size = params.page_size;
      if (params.search) cleanParams.search = params.search;
      if (params.category) cleanParams.category = params.category;
      if (params.season) cleanParams.season = params.season;
      if (params.sort_by) cleanParams.sort_by = params.sort_by;
      if (params.sort_order) cleanParams.sort_order = params.sort_order;

      const res = await api.get<PaginatedResponse<ClothingItem>>("/wardrobe", { params: cleanParams });
      return res.data;
    },
  });

  const handleSearch = useCallback((query: string) => {
    setParams((prev) => ({ ...prev, search: query, page: 1 }));
  }, []);

  const handleCategoryChange = useCallback((category: string) => {
    setParams((prev) => ({ ...prev, category, page: 1 }));
  }, []);

  const handleSeasonChange = useCallback((season: string) => {
    setParams((prev) => ({ ...prev, season, page: 1 }));
  }, []);

  const handleSortByChange = useCallback((sort_by: string) => {
    setParams((prev) => ({ ...prev, sort_by, page: 1 }));
  }, []);

  const handleSortOrderChange = useCallback((sort_order: "asc" | "desc") => {
    setParams((prev) => ({ ...prev, sort_order, page: 1 }));
  }, []);

  const handlePageChange = useCallback((page: number) => {
    setParams((prev) => ({ ...prev, page }));
  }, []);

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">My Wardrobe</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            {data?.pagination.total_items ?? 0} items in your wardrobe
          </p>
        </div>
        <Link
          href="/wardrobe/upload"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Upload Item
        </Link>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <SearchBar onSearch={handleSearch} />
        </div>
        <FilterPanel
          category={params.category || ""}
          season={params.season || ""}
          onCategoryChange={handleCategoryChange}
          onSeasonChange={handleSeasonChange}
        />
        <SortDropdown
          sortBy={params.sort_by || "created_at"}
          sortOrder={params.sort_order || "desc"}
          onSortByChange={handleSortByChange}
          onSortOrderChange={handleSortOrderChange}
        />
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : error ? (
        <div className="text-center py-16 text-red-500">
          Failed to load wardrobe items. Please try again.
        </div>
      ) : (
        <>
          <ClothingGrid items={data?.data || []} />
          {data?.pagination && (
            <Pagination pagination={data.pagination} onPageChange={handlePageChange} />
          )}
        </>
      )}
    </div>
  );
}
