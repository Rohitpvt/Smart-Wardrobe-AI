import { m } from "framer-motion";
import { staggerContainer } from "@/lib/animations";
import { useIntelligenceDashboard } from "@/hooks/use-intelligence";
import { IntelligenceFeedCard } from "./IntelligenceFeedCard";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { WidgetSkeleton } from "@/components/ui/skeleton-loaders";
import { OpportunityCard } from "./OpportunityCard";
import { WeeklyReportCard } from "./WeeklyReportCard";
import { GoalsProgressCard } from "./GoalsProgressCard";
import { Loader2 } from "lucide-react";

export function WardrobeIntelligenceCenter() {
  const { data, isLoading, isError } = useIntelligenceDashboard();

  if (isLoading) {
    return (
      <GlassPanel className="p-8 border border-brand-purple/20 relative overflow-hidden group">
        <div className="flex items-center justify-center py-6">
          <WidgetSkeleton />
        </div>
      </GlassPanel>
    );
  }

  if (isError || !data) {
    return null;
  }

  const feed = data.feed ?? [];
  const opportunities = data.opportunities ?? [];
  const goals = data.goals ?? [];
  const weekly_report = data.weekly_report ?? null;

  const hasContent = feed.length > 0 || opportunities.length > 0 || goals.length > 0 || !!weekly_report;

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
        {weekly_report && (
          <div className="md:col-span-2 row-span-1">
            <WeeklyReportCard report={weekly_report} />
          </div>
        )}
        
        {feed.length > 0 && (
          <div className="col-span-1 row-span-1">
            <IntelligenceFeedCard items={feed} />
          </div>
        )}

        {opportunities.length > 0 && (
          <div className="col-span-1 row-span-1">
            <OpportunityCard opportunities={opportunities} />
          </div>
        )}

        {/* If goals exist, display them in the next available slot */}
        {goals.length > 0 && (
          <div className="col-span-1 row-span-1">
            <GoalsProgressCard goals={goals} />
          </div>
        )}
      </m.div>
    </div>
  );
}
