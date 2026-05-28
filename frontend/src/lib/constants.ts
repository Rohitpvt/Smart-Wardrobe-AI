/**
 * Smart Wardrobe AI — Application Constants
 */

export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || "Smart Wardrobe AI";

export const NAVIGATION_LINKS = [
  { label: "Features", href: "#features" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Get Started", href: "#cta" },
] as const;

export const CLOTHING_CATEGORIES = [
  "top",
  "bottom",
  "shoes",
  "accessory",
  "outerwear",
] as const;

export const SEASONS = ["spring", "summer", "fall", "winter"] as const;

export const OCCASIONS = [
  "casual",
  "formal",
  "business",
  "sport",
  "party",
  "outdoor",
] as const;
