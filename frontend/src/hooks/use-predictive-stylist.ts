import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import { 
  PredictiveInsightsResponse, 
  PredictiveOpportunitiesResponse, 
  PredictiveForecastResponse 
} from "@/types/predictive-stylist";

export function usePredictiveStylist() {
  
  const insightsQuery = useQuery({
    queryKey: ["predictive-insights"],
    queryFn: async () => {
      const res = await api.get<PredictiveInsightsResponse>("/predictive-stylist/insights");
      return res.data;
    }
  });

  const opportunitiesQuery = useQuery({
    queryKey: ["predictive-opportunities"],
    queryFn: async () => {
      const res = await api.get<PredictiveOpportunitiesResponse>("/predictive-stylist/opportunities");
      return res.data;
    }
  });

  const forecastQuery = useQuery({
    queryKey: ["predictive-forecast"],
    queryFn: async () => {
      const res = await api.get<PredictiveForecastResponse>("/predictive-stylist/forecast");
      return res.data;
    }
  });

  return {
    insightsQuery,
    opportunitiesQuery,
    forecastQuery
  };
}
