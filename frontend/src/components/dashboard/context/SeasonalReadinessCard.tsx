import { m } from "framer-motion";
import { fadeUp } from "@/lib/animations";
import { ReadinessScore } from "@/types/intelligence";
import { ThermometerSun, Snowflake, Umbrella, Briefcase, Plane, AlertCircle, CheckCircle2 } from "lucide-react";

interface Props {
  readinessScores: Record<string, ReadinessScore>;
}

export function SeasonalReadinessCard({ readinessScores }: Props) {
  if (!readinessScores || Object.keys(readinessScores).length === 0) return null;

  const getIcon = (key: string) => {
    switch(key) {
      case "Summer": return ThermometerSun;
      case "Winter": return Snowflake;
      case "Monsoon": return Umbrella;
      case "Formal": return Briefcase;
      case "Travel": return Plane;
      default: return ThermometerSun;
    }
  };

  const getColor = (score: number) => {
    if (score >= 80) return "text-emerald-400 bg-emerald-500/10";
    if (score >= 50) return "text-yellow-400 bg-yellow-500/10";
    return "text-red-400 bg-red-500/10";
  };

  return (
    <m.div variants={fadeUp} className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md h-full flex flex-col xl:col-span-2">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <ThermometerSun className="w-5 h-5 text-amber-500" />
          Wardrobe Readiness
        </h3>
      </div>

      <div className="flex flex-col gap-4 overflow-y-auto pr-2 custom-scrollbar flex-1">
        {Object.entries(readinessScores).map(([key, data]) => {
          const Icon = getIcon(key);
          const colorClass = getColor(data.score);
          
          return (
            <div key={key} className="bg-surface-2/50 rounded-xl p-4 border border-white/5 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${colorClass}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-medium text-white">{key} Readiness</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${data.score >= 80 ? 'bg-emerald-500' : data.score >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`} 
                      style={{ width: `${data.score}%` }}
                    />
                  </div>
                  <span className="text-xs font-medium text-white/80 w-8 text-right">{data.score}%</span>
                </div>
              </div>
              
              {/* Expandable or compact insights */}
              <div className="pl-11 pr-2">
                {data.gaps.length > 0 && (
                  <div className="flex items-start gap-1.5 mt-1">
                    <AlertCircle className="w-3.5 h-3.5 text-red-400 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-white/60 leading-snug"><span className="text-white/80 font-medium">Gap:</span> {data.gaps[0]}</p>
                  </div>
                )}
                {data.recommendations.length > 0 && (
                  <div className="flex items-start gap-1.5 mt-1.5 border-t border-white/5 pt-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-brand-teal mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-white/60 leading-snug"><span className="text-white/80 font-medium">Rec:</span> {data.recommendations[0]}</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </m.div>
  );
}
