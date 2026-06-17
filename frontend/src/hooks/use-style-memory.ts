import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import { StyleMemoryResponse, FeedbackRequest, FeedbackResponse } from "@/types/style-memory";
import { toast } from "sonner";

export function useStyleMemory() {
  const queryClient = useQueryClient();

  const profileQuery = useQuery({
    queryKey: ["style-memory-profile"],
    queryFn: async () => {
      const res = await api.get<StyleMemoryResponse>("/style-memory/profile");
      return res.data.data;
    }
  });

  const feedbackMutation = useMutation({
    mutationFn: async (data: FeedbackRequest) => {
      const res = await api.post<FeedbackResponse>("/feedback/outfit", data);
      return res.data;
    },
    onSuccess: (_, variables) => {
      const msgs: Record<string, string> = {
        like: "Outfit liked. We'll show you more like this.",
        love: "Outfit loved! This will heavily influence your style profile.",
        dislike: "Noted. We'll avoid suggesting similar outfits.",
        save_for_later: "Outfit saved to your collection.",
        wore_it: "Marked as worn! This significantly boosts these items.",
        skip: "Skipped. We'll adjust your future recommendations."
      };
      toast.success(msgs[variables.feedback_type] || "Feedback recorded.");
      queryClient.invalidateQueries({ queryKey: ["style-memory-profile"] });
      // Might want to invalidate recommendations or intelligence depending on context
    },
    onError: () => {
      toast.error("Failed to record feedback. Please try again.");
    }
  });

  return {
    profileQuery,
    feedbackMutation
  };
}
