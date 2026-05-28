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
  fullName: string;
  gender?: string;
  stylePreference?: string;
  avatarUrl?: string;
  isActive: boolean;
  createdAt: string;
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
