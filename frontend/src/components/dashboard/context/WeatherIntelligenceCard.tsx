import { m } from "framer-motion";
import { fadeUp } from "@/lib/animations";
import { IntelligenceFeedItem } from "@/types/intelligence";
import { CloudRain, AlertTriangle, Wind, Sun } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  items: IntelligenceFeedItem[];
}

export function WeatherIntelligenceCard({ items }: Props) {
  return (
    <m.div variants={fadeUp} className="bg-gradient-to-br from-blue-900/40 to-indigo-900/40 border border-blue-500/20 rounded-2xl p-6 backdrop-blur-md h-full flex flex-col relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-3xl rounded-full" />
      
      <div className="flex items-center justify-between mb-6 relative z-10">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <CloudRain className="w-5 h-5 text-blue-400" />
          Weather Alerts
        </h3>
      </div>

      <div className="flex flex-col gap-4 overflow-y-auto custom-scrollbar flex-1 pr-2 relative z-10">
        {items.map((item) => {
          let severityClass = "text-blue-400 bg-blue-500/10";
          let Icon = CloudRain;
          
          // Determine visual severity from confidence
          if (item.confidence_score >= 95) {
            severityClass = "text-red-400 bg-red-500/10";
            Icon = AlertTriangle;
          } else if (item.confidence_score >= 80) {
            severityClass = "text-orange-400 bg-orange-500/10";
            Icon = Sun;
          } else {
            Icon = Wind;
          }

          return (
            <div key={item.id} className="bg-surface-2/40 rounded-xl p-4 border border-white/5">
              <div className="flex items-start gap-3">
                <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center mt-0.5", severityClass)}>
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm text-white/90 leading-relaxed">{item.content}</p>
                  <div className="flex items-center gap-3 mt-3">
                    <span className="text-[10px] uppercase tracking-wider font-medium text-white/40">
                      Impact: {item.impact_score.toFixed(0)}
                    </span>
                    <span className="text-[10px] uppercase tracking-wider font-medium text-blue-400/60 flex items-center gap-1">
                      Conf: {item.confidence_score.toFixed(0)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </m.div>
  );
}
