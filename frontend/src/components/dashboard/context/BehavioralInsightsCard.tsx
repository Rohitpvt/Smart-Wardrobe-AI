import { m } from "framer-motion";
import { fadeUp } from "@/lib/animations";
import { IntelligenceFeedItem } from "@/types/intelligence";
import { Activity, Zap, TrendingUp } from "lucide-react";

interface Props {
  items: IntelligenceFeedItem[];
}

export function BehavioralInsightsCard({ items }: Props) {
  return (
    <m.div variants={fadeUp} className="bg-gradient-to-br from-purple-900/20 to-fuchsia-900/20 border border-purple-500/20 rounded-2xl p-6 backdrop-blur-md h-full flex flex-col relative overflow-hidden">
      <div className="absolute bottom-0 right-0 w-40 h-40 bg-purple-500/10 blur-3xl rounded-full" />

      <div className="flex items-center justify-between mb-6 relative z-10">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <Activity className="w-5 h-5 text-purple-400" />
          Behavioral Insights
        </h3>
      </div>

      <div className="flex flex-col gap-4 overflow-y-auto custom-scrollbar flex-1 pr-2 relative z-10">
        {items.map((item) => (
          <div key={item.id} className="group relative p-4 rounded-xl border border-white/5 bg-surface-2/40 hover:bg-surface-2 transition-all">
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-purple-500/10 text-purple-400 flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm text-white/90 leading-relaxed mb-3">{item.content}</p>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-yellow-500/80" />
                    <span className="text-[10px] uppercase tracking-wider font-medium text-white/40">
                      Impact: {item.impact_score.toFixed(0)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <span className="text-[10px] uppercase tracking-wider font-medium text-purple-400/60">
                      Conf: {item.confidence_score.toFixed(0)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </m.div>
  );
}
