import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import { 
  IntelligenceDashboardData, 
  WardrobeGoal 
} from "@/types/intelligence";

export function useIntelligenceDashboard() {
  return useQuery({
    queryKey: ["intelligence-dashboard"],
    queryFn: async (): Promise<IntelligenceDashboardData> => {
      // The API returns the raw dict, so no `data.data` nesting if we didn't wrap it in a standard response in the endpoint.
      // Wait, let's check intelligence endpoint. It returns dict directly.
      const response = await api.get<IntelligenceDashboardData>("/intelligence/dashboard");
      return response.data;
    },
    // Cache for 5 minutes on client to avoid spamming the lazy evaluation check
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
