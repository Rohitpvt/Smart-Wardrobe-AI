/**
 * Smart Wardrobe AI — Shared TypeScript Type Definitions
 *
 * Central type definitions used across the frontend application.
 * Add new types here as features are implemented.
 */

// --- User ---
export interface User {
  id: string;
  email: string;
  full_name: string;
  gender_preference?: string;
  style_preference?: string;
  profile_image_url?: string;
  is_active: boolean;
  is_profile_complete: boolean;
  created_at: string;
}

// --- Clothing Item ---
export interface ClothingItem {
  id: string;
  userId: string;
  s3Key: string;
  name: string;
  category: ClothingCategory;
  subCategory: string;
  colorPrimary: string;
  colorSecondary?: string;
  pattern: string;
  material?: string;
  season: Season[];
  occasion: Occasion[];
  brand?: string;
  timesWorn: number;
  lastWornAt?: string;
  aiTags?: Record<string, unknown>;
  imageUrl?: string; // Presigned URL (temporary)
  createdAt: string;
  updatedAt: string;
}

export type ClothingCategory =
  | "top"
  | "bottom"
  | "shoes"
  | "accessory"
  | "outerwear";

export type Season = "spring" | "summer" | "fall" | "winter";

export type Occasion =
  | "casual"
  | "formal"
  | "business"
  | "sport"
  | "party"
  | "outdoor";

// --- Outfit ---
export interface Outfit {
  id: string;
  userId: string;
  name: string;
  occasion: Occasion;
  season: Season;
  rating?: number;
  isFavorite: boolean;
  items: ClothingItem[];
  createdAt: string;
}

// --- AI Recommendation ---
export interface OutfitRecommendation {
  id: string;
  clothingItemIds: string[];
  outfitName: string;
  occasion: string;
  reasoning: string;
  styleScore: number;
  weatherAppropriate: boolean;
  colorHarmonyScore: number;
}

// --- API Response ---
export interface ApiResponse<T> {
  data: T;
  message?: string;
  status: "success" | "error";
}

// --- Health Check ---
export interface HealthStatus {
  status: string;
  version: string;
  service: string;
}

// --- Auth Data ---
export interface LoginData {
  email?: string;
  password?: string;
  [key: string]: any;
}

export interface RegisterData {
  email?: string;
  password?: string;
  full_name?: string;
  [key: string]: any;
}
