import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import { 
  IntelligenceDashboardData, 
  WardrobeHealth
} from "@/types/intelligence";

export function useIntelligenceDashboard() {
  return useQuery({
    queryKey: ["intelligence-dashboard"],
    queryFn: async (): Promise<IntelligenceDashboardData> => {
      const response = await api.get<IntelligenceDashboardData>("/dashboard/intelligence");
      return response.data;
    },
    staleTime: 5 * 60 * 1000, 
  });
}

export function useWardrobeHealth() {
  return useQuery({
    queryKey: ["wardrobe-health-v2"],
    queryFn: async (): Promise<WardrobeHealth> => {
      const response = await api.get<WardrobeHealth>("/intelligence/wardrobe-health");
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useUpdateOpportunity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      await api.patch(`/intelligence/opportunities/${id}/status`, { status });
      return { id, status };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["intelligence-dashboard"] });
    },
  });
}
