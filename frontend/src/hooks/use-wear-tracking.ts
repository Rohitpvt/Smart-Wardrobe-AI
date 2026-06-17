import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import { 
  OutfitHistoryResponse, 
  WearAnalyticsResponse, 
  RepetitionResponse,
  LogWearEventPayload
} from "@/types/wear-tracking";

export function useWearTracking() {
  const queryClient = useQueryClient();

  const historyQuery = useQuery({
    queryKey: ["wear-history"],
    queryFn: async () => {
      const res = await api.get<OutfitHistoryResponse>("/wear-tracking/history");
      return res.data;
    }
  });

  const analyticsQuery = useQuery({
    queryKey: ["wear-analytics"],
    queryFn: async () => {
      const res = await api.get<WearAnalyticsResponse>("/wear-tracking/analytics");
      return res.data;
    }
  });

  const repetitionQuery = useQuery({
    queryKey: ["wear-repetition"],
    queryFn: async () => {
      const res = await api.get<RepetitionResponse>("/wear-tracking/repetition");
      return res.data;
    }
  });

  const logWearEvent = useMutation({
    mutationFn: async (payload: LogWearEventPayload) => {
      const res = await api.post("/wear-tracking/log", payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wear-history"] });
      queryClient.invalidateQueries({ queryKey: ["wear-analytics"] });
      queryClient.invalidateQueries({ queryKey: ["wear-repetition"] });
      queryClient.invalidateQueries({ queryKey: ["wardrobe-stats"] }); // invalidate global stats
    }
  });

  return {
    historyQuery,
    analyticsQuery,
    repetitionQuery,
    logWearEvent
  };
}
