"use client";

import { useFashionEvolution } from "@/lib/api/intelligence";
import { Skeleton } from "@/components/ui/skeleton";
import { GitCommit, TrendingUp, AlertCircle, Calendar } from "lucide-react";
import { format } from "date-fns";

export function FashionEvolutionCard() {
  const { data: evolution, isLoading, isError } = useFashionEvolution();

  if (isLoading) {
    return (
      <div className="p-6 rounded-2xl bg-surface-1 border border-white/5 space-y-4">
        <div className="flex items-center gap-2">
          <GitCommit className="w-5 h-5 text-brand-purple" />
          <h3 className="font-heading font-semibold text-white">Fashion Evolution</h3>
        </div>
        <Skeleton className="h-32 w-full bg-white/5 rounded-xl" />
      </div>
    );
  }

  if (isError || !evolution) {
    return (
      <div className="p-6 rounded-2xl bg-surface-1 border border-white/5 space-y-2">
        <div className="flex items-center gap-2 text-rose-400">
          <AlertCircle className="w-5 h-5" />
          <h3 className="font-heading font-semibold">Evolution Data Unavailable</h3>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 rounded-2xl bg-surface-1 border border-white/5 hover:border-white/10 transition-colors group">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-brand-purple/10 text-brand-purple ring-1 ring-brand-purple/20">
            <GitCommit className="w-5 h-5" />
          </div>
          <h3 className="font-heading font-semibold text-white group-hover:text-brand-purple transition-colors">Style Evolution</h3>
        </div>
        <div className="text-right">
          <div className="text-2xl font-heading font-bold text-white">{evolution.growth_score}%</div>
          <div className="text-xs text-slate-500 uppercase tracking-wider">Growth Score</div>
        </div>
      </div>

      <div className="space-y-4">
        {evolution.major_changes.length > 0 && (
          <div className="p-3 rounded-xl bg-brand-purple/5 border border-brand-purple/10">
            <div className="flex items-center gap-1.5 text-brand-purple mb-2">
              <TrendingUp className="w-4 h-4" />
              <span className="text-xs font-label-md uppercase tracking-wider">Major Shifts</span>
            </div>
            <ul className="text-sm text-brand-purple/80 pl-5 list-disc space-y-1">
              {evolution.major_changes.map((change, i) => <li key={i}>{change}</li>)}
            </ul>
          </div>
        )}

        <div className="space-y-3 relative before:absolute before:inset-0 before:ml-[11px] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-white/10 before:to-transparent">
          {evolution.timeline.length > 0 ? evolution.timeline.slice(-3).map((event, i) => (
            <div key={i} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
              <div className="flex items-center justify-center w-6 h-6 rounded-full border border-white/10 bg-surface-1 text-slate-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                <Calendar className="w-3 h-3" />
              </div>
              <div className="w-[calc(100%-2.5rem)] md:w-[calc(50%-1.5rem)] p-3 rounded-xl bg-white/5 border border-white/5 shadow">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-slate-200 text-sm">{event.event}</span>
                  <span className="text-xs text-slate-500">{format(new Date(event.date), "MMM d, yyyy")}</span>
                </div>
                <div className="text-xs text-slate-400">{event.description}</div>
              </div>
            </div>
          )) : (
            <div className="text-sm text-slate-500 text-center py-4">Not enough timeline data yet. Check back next week!</div>
          )}
        </div>
      </div>
    </div>
  );
}
