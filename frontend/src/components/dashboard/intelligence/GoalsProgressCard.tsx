import { m } from "framer-motion";
import { fadeUp } from "@/lib/animations";
import { WardrobeGoal } from "@/types/intelligence";
import { Trophy, ArrowRight } from "lucide-react";
import Link from "next/link";

interface Props {
  goals: WardrobeGoal[];
}

export function GoalsProgressCard({ goals }: Props) {
  if (goals.length === 0) return null;

  return (
    <m.div variants={fadeUp} className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-500" />
          Active Goals
        </h3>
        <Link href="/settings">
          <button className="text-xs text-white/50 hover:text-white transition-colors flex items-center gap-1">
            Manage <ArrowRight className="w-3 h-3" />
          </button>
        </Link>
      </div>

      <div className="flex flex-col gap-5 flex-1 overflow-y-auto pr-2 custom-scrollbar">
        {goals.map((goal) => {
          // Calculate percentage safely
          let percent = 0;
          if (goal.metric_target > 0) {
            percent = Math.min(100, Math.max(0, (goal.current_progress / goal.metric_target) * 100));
          }

          return (
            <div key={goal.id} className="group">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-white/90">{goal.title}</span>
                <span className="text-xs text-white/50">{goal.current_progress.toFixed(1)} / {goal.metric_target.toFixed(1)}</span>
              </div>
              <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden relative">
                <m.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${percent}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="absolute top-0 left-0 h-full bg-gradient-to-r from-yellow-600 to-yellow-400 rounded-full"
                />
              </div>
              <div className="flex items-center justify-between mt-1.5">
                <span className="text-[10px] text-white/30 uppercase tracking-wider">{goal.goal_type.replace("_", " ")}</span>
                <span className="text-[10px] text-yellow-500/80 font-medium">{percent.toFixed(0)}%</span>
              </div>
            </div>
          );
        })}
      </div>
    </m.div>
  );
}
