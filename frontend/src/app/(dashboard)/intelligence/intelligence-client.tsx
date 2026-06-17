"use client";

import { m } from "framer-motion";
import { StyleDNACard } from "@/components/dashboard/intelligence/StyleDNACard";
import { WardrobeHealthCard } from "@/components/dashboard/intelligence/WardrobeHealthCard";
import { UsageIntelligenceCard } from "@/components/dashboard/intelligence/UsageIntelligenceCard";
import { SeasonalReadinessCard } from "@/components/dashboard/intelligence/SeasonalReadinessCard";
import { FashionEvolutionCard } from "@/components/dashboard/intelligence/FashionEvolutionCard";

export function IntelligenceClient() {
  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold text-white mb-2">Wardrobe Intelligence</h1>
          <p className="text-slate-400">Advanced AI analytics, style evolution, and predictive insights.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column - Core Health & DNA */}
        <div className="lg:col-span-8 space-y-6">
          <WardrobeHealthCard />
          <UsageIntelligenceCard />
          <FashionEvolutionCard />
        </div>

        {/* Right Column - Secondary Analysis */}
        <div className="lg:col-span-4 space-y-6">
          <StyleDNACard />
          <SeasonalReadinessCard />
        </div>
      </div>
    </div>
  );
}
