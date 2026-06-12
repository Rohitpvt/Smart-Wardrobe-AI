/**
 * TypeScript types for Wardrobe features.
 */

export interface ClothingItem {
  id: string;
  user_id: string;
  image_url: string;
  name: string;
  clothing_type: string;
  category: string;
  color: string;
  pattern: string | null;
  material: string | null;
  season: string | null;
  brand: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface ClothingItemCreate {
  name: string;
  clothing_type: string;
  category: string;
  color: string;
  pattern?: string;
  material?: string;
  season?: string;
  brand?: string;
  notes?: string;
}

export interface ClothingItemUpdate {
  name?: string;
  clothing_type?: string;
  category?: string;
  color?: string;
  pattern?: string;
  material?: string;
  season?: string;
  brand?: string;
  notes?: string;
}

export interface PaginationMeta {
  page: number;
  page_size: number;
  total_items: number;
  total_pages: number;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: PaginationMeta;
}

export interface WardrobeListParams {
  page?: number;
  page_size?: number;
  search?: string;
  category?: string;
  color?: string;
  season?: string;
  clothing_type?: string;
  sort_by?: string;
  sort_order?: "asc" | "desc";
}

export const CATEGORIES = ["TOPWEAR", "BOTTOMWEAR", "FOOTWEAR", "OUTERWEAR", "ACCESSORY"] as const;
export const SEASONS = ["SUMMER", "WINTER", "SPRING", "AUTUMN", "ALL_SEASON"] as const;
