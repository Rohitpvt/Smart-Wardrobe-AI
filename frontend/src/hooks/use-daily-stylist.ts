import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import { DailyStylistResponse } from "@/types/daily-stylist";

export function useDailyStylist() {
  const briefQuery = useQuery({
    queryKey: ["daily-style-brief"],
    queryFn: async () => {
      const res = await api.get<DailyStylistResponse>("/daily-stylist/brief");
      return res.data;
    },
    retry: false
  });

  return {
    briefQuery
  };
}
