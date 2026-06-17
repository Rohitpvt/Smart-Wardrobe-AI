import { Metadata } from "next";
import { IntelligenceClient } from "./intelligence-client";

export const metadata: Metadata = {
  title: "Intelligence | Smart Wardrobe AI",
  description: "Advanced Wardrobe Intelligence Engine",
};

export default function IntelligencePage() {
  return <IntelligenceClient />;
}
