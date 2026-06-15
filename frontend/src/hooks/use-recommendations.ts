import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import { 
  RecommendationListResponse, 
  GenerateRecommendationRequest, 
  GenerateRecommendationResponse, 
  OutfitRecommendation 
} from "@/types/recommendations";
import { PaginatedResponse } from "@/types/wardrobe";
import axios from "axios";
import { toast } from "sonner";

export function useRecommendations(page: number = 1, pageSize: number = 10) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["recommendations", page],
    queryFn: async () => {
      const res = await api.get<RecommendationListResponse>("/recommendations", {
        params: { page, page_size: pageSize }
      });
      return res.data;
    }
  });

  const generateMutation = useMutation({
    mutationFn: async (data: GenerateRecommendationRequest) => {
      const res = await api.post<GenerateRecommendationResponse>("/recommendations/generate", data);
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["recommendations", 1], (old: PaginatedResponse<OutfitRecommendation> | undefined) => {
        if (!old) return old;
        return {
          ...old,
          data: [data.data, ...old.data],
          pagination: {
            ...old.pagination,
            total_items: old.pagination.total_items + 1,
          }
        };
      });
      queryClient.invalidateQueries({ queryKey: ["recommendations"] });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/recommendations/${id}`);
      return id;
    },
    onMutate: async (deletedId) => {
      await queryClient.cancelQueries({ queryKey: ["recommendations"] });
      const previousData = queryClient.getQueryData<RecommendationListResponse>(["recommendations", page]);
      
      if (previousData) {
        queryClient.setQueryData<RecommendationListResponse>(["recommendations", page], {
          ...previousData,
          data: previousData.data.filter((r) => r.id !== deletedId),
          pagination: {
            ...previousData.pagination,
            total_items: previousData.pagination.total_items - 1
          }
        });
      }
      return { previousData };
    },
    onError: (err, deletedId, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(["recommendations", page], context.previousData);
      }
      toast.error("Failed to delete recommendation.");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["recommendations", page] });
    }
  });

  const feedbackMutation = useMutation({
    mutationFn: async ({ id, feedback_type }: { id: string; feedback_type: string }) => {
      const res = await api.post(`/recommendations/${id}/feedback`, { feedback_type });
      return res.data;
    },
    onSuccess: () => {
      toast.success("Feedback recorded. Your personal stylist is learning!");
      // Optionally invalidate taste profile or dashboard
      queryClient.invalidateQueries({ queryKey: ["dashboard-taste-profile"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-predictive"] });
    },
    onError: () => {
      toast.error("Failed to record feedback.");
    }
  });

  return {
    query,
    generateMutation,
    deleteMutation,
    feedbackMutation
  };
}
