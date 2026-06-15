import { m } from "framer-motion";
import { staggerContainer } from "@/lib/animations";
import { useIntelligenceDashboard } from "@/hooks/use-intelligence";
import { SeasonalReadinessCard } from "./SeasonalReadinessCard";
import { WeatherIntelligenceCard } from "./WeatherIntelligenceCard";
import { BehavioralInsightsCard } from "./BehavioralInsightsCard";
import { CloudRain, Activity } from "lucide-react";

export function ContextIntelligenceSection() {
  const { data, isLoading, isError } = useIntelligenceDashboard();

  if (isLoading || isError || !data) return null;

  const weatherFeeds = data.feed.filter(item => item.feed_category === "weather");
  const behavioralFeeds = data.feed.filter(item => item.feed_category === "behavioral");

  // Only render if we have readiness scores or contextual feeds
  const hasContent = !!data.readiness_scores || weatherFeeds.length > 0 || behavioralFeeds.length > 0;
  
  if (!hasContent) return null;

  return (
    <div className="mb-12">
      <div className="mb-6">
        <h2 className="text-2xl font-bold tracking-tight text-white mb-1">Context Intelligence</h2>
        <p className="text-sm text-slate-400">Insights driven by weather, seasons, and your behavior patterns.</p>
      </div>

      <m.div 
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6 auto-rows-[280px]"
      >
        {data.readiness_scores && (
          <SeasonalReadinessCard readinessScores={data.readiness_scores} />
        )}

        {weatherFeeds.length > 0 ? (
          <WeatherIntelligenceCard items={weatherFeeds} />
        ) : (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col items-center justify-center text-center opacity-50">
            <CloudRain className="w-8 h-8 text-white/30 mb-3" />
            <p className="text-sm text-white/50">No critical weather triggers detected in your area.</p>
          </div>
        )}

        {behavioralFeeds.length > 0 ? (
          <BehavioralInsightsCard items={behavioralFeeds} />
        ) : (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col items-center justify-center text-center opacity-50">
            <Activity className="w-8 h-8 text-white/30 mb-3" />
            <p className="text-sm text-white/50">Collecting engagement patterns to surface behavioral insights.</p>
          </div>
        )}
      </m.div>
    </div>
  );
}
