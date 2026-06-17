import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import type {
  StyleDNA,
  WardrobeHealth,
  UsageIntelligence,
  SeasonalReadiness,
  FashionEvolution,
  OutfitSuccessPrediction,
} from '@/types/intelligence';

export const useStyleDNA = () => {
  return useQuery({
    queryKey: ['intelligence', 'style-dna'],
    queryFn: async () => {
      const response = await api.get<StyleDNA>('/intelligence/style-dna');
      return response.data;
    },
  });
};

export const useWardrobeHealth = () => {
  return useQuery({
    queryKey: ['intelligence', 'wardrobe-health'],
    queryFn: async () => {
      const response = await api.get<WardrobeHealth>('/intelligence/wardrobe-health');
      return response.data;
    },
  });
};

export const useUsageIntelligence = () => {
  return useQuery({
    queryKey: ['intelligence', 'usage'],
    queryFn: async () => {
      const response = await api.get<UsageIntelligence>('/intelligence/usage');
      return response.data;
    },
  });
};

export const useSeasonalReadiness = () => {
  return useQuery({
    queryKey: ['intelligence', 'seasonal'],
    queryFn: async () => {
      const response = await api.get<SeasonalReadiness>('/intelligence/seasonal');
      return response.data;
    },
  });
};

export const useFashionEvolution = () => {
  return useQuery({
    queryKey: ['intelligence', 'evolution'],
    queryFn: async () => {
      const response = await api.get<FashionEvolution>('/intelligence/evolution');
      return response.data;
    },
  });
};

export const useOutfitSuccessPrediction = () => {
  return useQuery({
    queryKey: ['intelligence', 'outfit-prediction'],
    queryFn: async () => {
      const response = await api.get<OutfitSuccessPrediction>('/intelligence/outfit-prediction');
      return response.data;
    },
  });
};
