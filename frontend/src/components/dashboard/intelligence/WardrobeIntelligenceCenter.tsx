import { m } from "framer-motion";
import { staggerContainer } from "@/lib/animations";
import { useIntelligenceDashboard } from "@/hooks/use-intelligence";
import { IntelligenceFeedCard } from "./IntelligenceFeedCard";
import { OpportunityCard } from "./OpportunityCard";
import { WeeklyReportCard } from "./WeeklyReportCard";
import { GoalsProgressCard } from "./GoalsProgressCard";
import { Loader2 } from "lucide-react";

export function WardrobeIntelligenceCenter() {
  const { data, isLoading, isError } = useIntelligenceDashboard();

  if (isLoading) {
    return (
      <div className="w-full h-48 flex flex-col items-center justify-center border border-white/5 bg-white/5 rounded-3xl mb-12">
        <Loader2 className="w-8 h-8 text-brand-blue animate-spin mb-4" />
        <p className="text-white/50 text-sm">Generating autonomous intelligence...</p>
      </div>
    );
  }

  if (isError || !data) {
    return null;
  }

  // If there's absolutely no data generated yet, we could hide it or show an empty state.
  // But usually, at least WeeklyReport will generate.
  const hasContent = data.feed.length > 0 || data.opportunities.length > 0 || data.goals.length > 0 || !!data.weekly_report;

  if (!hasContent) return null;

  return (
    <div className="mb-12">
      <div className="mb-6">
        <h2 className="text-2xl font-bold tracking-tight text-white mb-1">Wardrobe Intelligence Center</h2>
        <p className="text-sm text-slate-400">Proactive insights, opportunities, and AI coaching based on your activity.</p>
      </div>

      <m.div 
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 auto-rows-auto lg:auto-rows-[280px]"
      >
        {/* Row 1: Weekly Report (span 2), Feed (span 1), Opportunities (span 1) */}
        {data.weekly_report && (
          <div className="md:col-span-2 row-span-1">
            <WeeklyReportCard report={data.weekly_report} />
          </div>
        )}
        
        {data.feed.length > 0 && (
          <div className="col-span-1 row-span-1">
            <IntelligenceFeedCard items={data.feed} />
          </div>
        )}

        {data.opportunities.length > 0 && (
          <div className="col-span-1 row-span-1">
            <OpportunityCard opportunities={data.opportunities} />
          </div>
        )}

        {/* If goals exist, display them in the next available slot */}
        {data.goals.length > 0 && (
          <div className="col-span-1 row-span-1">
            <GoalsProgressCard goals={data.goals} />
          </div>
        )}
      </m.div>
    </div>
  );
}
