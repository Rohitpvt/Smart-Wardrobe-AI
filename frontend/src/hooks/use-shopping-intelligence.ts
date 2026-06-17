import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import { ShoppingOpportunitiesResponse } from "@/types/shopping-intelligence";

export function useShoppingIntelligence() {
  const opportunitiesQuery = useQuery({
    queryKey: ["shopping-opportunities"],
    queryFn: async () => {
      const res = await api.get<ShoppingOpportunitiesResponse>("/shopping-intelligence/opportunities");
      return res.data;
    }
  });

  return {
    opportunitiesQuery
  };
}
