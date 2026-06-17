"use client";

import { RecommendationSignals as SignalsType } from "@/types/recommendations";

interface Props {
  signals: SignalsType;
}

export function RecommendationSignals({ signals }: Props) {
  const signalData = [
    { label: "Style Match", value: signals.style_alignment, color: "bg-brand-purple" },
    { label: "Weather Match", value: signals.weather_alignment, color: "bg-sky-400" },
    { label: "Rotation Benefit", value: signals.rotation_benefit, color: "bg-amber-400" },
    { label: "Seasonal Match", value: signals.seasonal_alignment, color: "bg-emerald-400" }
  ];

  return (
    <div className="grid grid-cols-2 gap-x-6 gap-y-4">
      {signalData.map((signal, idx) => (
        <div key={idx} className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">{signal.label}</span>
            <span className="text-slate-300 font-medium">{signal.value}%</span>
          </div>
          <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
            <div 
              className={`h-full ${signal.color} rounded-full transition-all duration-1000 ease-out`}
              style={{ width: `${signal.value}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
