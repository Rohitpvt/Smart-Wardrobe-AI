import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import { 
  ExplainableRecommendationRequest, 
  ExplainableRecommendationResponse 
} from "@/types/recommendations";

export function useExplainableRecommendations() {
  const generateExplainableMutation = useMutation({
    mutationFn: async (data: ExplainableRecommendationRequest) => {
      const res = await api.post<ExplainableRecommendationResponse>("/recommendations/explainable", data);
      return res.data;
    }
  });

  return {
    generateExplainableMutation
  };
}
