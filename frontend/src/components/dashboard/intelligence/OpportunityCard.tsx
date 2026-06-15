import { m } from "framer-motion";
import { fadeUp } from "@/lib/animations";
import { WardrobeOpportunity } from "@/types/intelligence";
import { Target, Check, X } from "lucide-react";
import { useUpdateOpportunity } from "@/hooks/use-intelligence";

interface Props {
  opportunities: WardrobeOpportunity[];
}

export function OpportunityCard({ opportunities }: Props) {
  const updateMutation = useUpdateOpportunity();

  if (opportunities.length === 0) return null;

  const handleUpdate = (id: string, status: string) => {
    updateMutation.mutate({ id, status });
  };

  return (
    <m.div variants={fadeUp} className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <Target className="w-5 h-5 text-brand-teal" />
          High-ROI Opportunities
        </h3>
      </div>

      <div className="flex flex-col gap-4 flex-1 overflow-y-auto pr-2 custom-scrollbar">
        {opportunities.map((opp) => (
          <div key={opp.id} className="group relative p-4 rounded-xl border border-white/5 bg-surface-2/50 hover:bg-surface-2 transition-all">
            <h4 className="text-[15px] font-medium text-white mb-1">{opp.title}</h4>
            <p className="text-xs text-white/60 mb-3 leading-relaxed">{opp.description}</p>
            
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-brand-teal/80 font-medium uppercase tracking-wider bg-brand-teal/10 px-2 py-0.5 rounded">
                Impact: {opp.impact_score.toFixed(0)}
              </span>
              
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={() => handleUpdate(opp.id, "dismissed")}
                  disabled={updateMutation.isPending}
                  className="w-7 h-7 rounded-md bg-white/5 hover:bg-red-500/20 text-white/60 hover:text-red-400 flex items-center justify-center transition-colors"
                  title="Dismiss"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
                <button 
                  onClick={() => handleUpdate(opp.id, "completed")}
                  disabled={updateMutation.isPending}
                  className="w-7 h-7 rounded-md bg-brand-teal/20 hover:bg-brand-teal/40 text-brand-teal flex items-center justify-center transition-colors"
                  title="Mark Completed"
                >
                  <Check className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </m.div>
  );
}
