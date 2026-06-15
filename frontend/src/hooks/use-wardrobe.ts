import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import { PaginatedResponse, ClothingItem, WardrobeListParams } from "@/types/wardrobe";

export function useWardrobe(initialParams: Partial<WardrobeListParams> = {}) {
  const [params, setParams] = useState<WardrobeListParams>({
    page: 1,
    page_size: 20,
    search: "",
    category: "",
    season: "",
    sort_by: "created_at",
    sort_order: "desc",
    ...initialParams
  });

  const query = useQuery({
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
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const queryClient = useQueryClient();

  const logWearMutation = useMutation({
    mutationFn: async (itemId: string) => {
      const res = await api.post<ClothingItem>(`/wardrobe/${itemId}/wear`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wardrobe"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-intelligence"] });
    }
  });

  return {
    params,
    setParams,
    query,
    logWear: logWearMutation,
    actions: {
      handleSearch,
      handleCategoryChange,
      handleSeasonChange,
      handleSortByChange,
      handleSortOrderChange,
      handlePageChange
    }
  };
}
