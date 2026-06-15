import { m } from "framer-motion";
import { fadeUp } from "@/lib/animations";
import { WeeklyReport } from "@/types/intelligence";
import { CalendarDays, Sparkles } from "lucide-react";

interface Props {
  report?: WeeklyReport;
}

export function WeeklyReportCard({ report }: Props) {
  if (!report) return null;

  const { snapshot_json, coaching_advice } = report;

  // Attempt to parse observation/metric/recommendation if present
  let coachContent = coaching_advice || "No coaching advice generated.";
  let observation = "";
  let metric = "";
  let recommendation = "";

  if (coachContent.includes("Observation:") && coachContent.includes("Recommendation:")) {
    const obsMatch = coachContent.match(/Observation:\s*([\s\S]*?)(?=Metric:|Recommendation:|$)/);
    const metMatch = coachContent.match(/Metric:\s*([\s\S]*?)(?=Recommendation:|$)/);
    const recMatch = coachContent.match(/Recommendation:\s*([\s\S]*)/);
    
    if (obsMatch) observation = obsMatch[1].trim();
    if (metMatch) metric = metMatch[1].trim();
    if (recMatch) recommendation = recMatch[1].trim();
  }

  return (
    <m.div variants={fadeUp} className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md h-full flex flex-col col-span-1 md:col-span-2">
      <div className="flex items-center justify-between mb-6 border-b border-white/10 pb-4">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <CalendarDays className="w-5 h-5 text-brand-blue" />
          Weekly Performance
        </h3>
        <span className="text-sm text-white/50">
          {new Date(report.report_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1">
        {/* Metrics Column */}
        <div className="flex flex-col gap-4 justify-center">
          <div className="bg-surface-2/50 rounded-xl p-4 border border-white/5">
            <p className="text-xs text-white/40 uppercase tracking-wider mb-1">Rotation Score</p>
            <p className="text-2xl font-light text-white">{snapshot_json.rotation_score?.toFixed(0) || 0}<span className="text-sm text-white/40 ml-1">/ 100</span></p>
          </div>
          <div className="bg-surface-2/50 rounded-xl p-4 border border-white/5">
            <p className="text-xs text-white/40 uppercase tracking-wider mb-1">Avg CPW</p>
            <p className="text-2xl font-light text-white"><span className="text-sm text-white/40 mr-1">$</span>{snapshot_json.average_cpw?.toFixed(2) || "0.00"}</p>
          </div>
        </div>

        {/* Coaching Column */}
        <div className="md:col-span-2 bg-brand-purple/10 border border-brand-purple/20 rounded-xl p-5 relative overflow-hidden flex flex-col justify-center">
          <div className="absolute top-0 left-0 w-1 h-full bg-brand-purple"></div>
          <h4 className="text-sm font-medium text-brand-purple flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4" /> AI Stylist Coaching
          </h4>
          
          {observation ? (
            <div className="space-y-3">
              <p className="text-sm text-white/90 leading-relaxed"><span className="text-white/40 font-medium">Observation:</span> {observation}</p>
              {metric && <p className="text-xs text-white/50"><span className="text-white/30 font-medium">Metric:</span> {metric}</p>}
              <div className="mt-2 pt-2 border-t border-brand-purple/20">
                <p className="text-sm text-white font-medium"><span className="text-brand-purple/80 mr-1">→</span> {recommendation}</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-white/80 whitespace-pre-wrap">{coachContent}</p>
          )}
        </div>
      </div>
    </m.div>
  );
}
