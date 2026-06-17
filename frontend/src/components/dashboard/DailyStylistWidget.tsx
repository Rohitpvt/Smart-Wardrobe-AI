"use client";

import { useDailyStylist } from "@/hooks/use-daily-stylist";
import { m } from "framer-motion";
import { CalendarDays, ArrowRight, Loader2, Shirt } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { fadeUp } from "@/lib/animations";

export function DailyStylistWidget() {
  const { briefQuery } = useDailyStylist();

  if (briefQuery.isLoading) {
    return (
      <m.div variants={fadeUp} className="bg-surface-1/70 backdrop-blur-xl border border-white/10 rounded-2xl p-6 h-40 animate-pulse flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-brand-blue animate-spin" />
      </m.div>
    );
  }

  const res = briefQuery.data;
  if (!res || !res.success || !res.brief) return null;

  const brief = res.brief;
  const top = brief?.recommended_outfit?.top;

  if (!top) return null;

  return (
    <m.div variants={fadeUp} className="relative overflow-hidden bg-gradient-to-br from-brand-blue/10 to-brand-purple/5 border border-white/10 rounded-2xl p-6 group shadow-lg">
      <div className="absolute top-0 right-0 w-32 h-32 bg-brand-purple/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
      
      <div className="flex items-center justify-between mb-4 relative z-10">
        <div className="flex items-center gap-2 text-brand-blue">
          <CalendarDays className="w-5 h-5" />
          <h3 className="font-semibold tracking-wide uppercase text-sm">Today's Style Brief</h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-2 py-1 bg-white/10 rounded-md text-white">{brief.confidence}% Match</span>
        </div>
      </div>

      <div className="flex items-center gap-4 relative z-10">
        <div className="w-16 h-16 rounded-xl bg-surface-2 border border-white/5 relative overflow-hidden flex-shrink-0">
          {top.image_url ? (
            <Image 
              src={top.image_url} 
              alt={top.name} 
              fill 
              className="object-cover mix-blend-screen opacity-90"
              unoptimized
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <Shirt className="w-6 h-6 text-white/20" />
            </div>
          )}
        </div>
        
        <div className="flex-1">
          <p className="text-sm text-slate-300 line-clamp-2 leading-relaxed">
            {brief.weather.temperature !== null ? `${Math.round(brief.weather.temperature)}° • ` : ''} 
            {brief.style_tip}
          </p>
        </div>
        
        <Link 
          href="/dashboard/daily-stylist"
          className="w-10 h-10 rounded-full bg-brand-blue hover:bg-brand-blue/90 text-white flex items-center justify-center transition-colors shrink-0 shadow-[0_0_15px_rgba(59,130,246,0.3)]"
        >
          <ArrowRight className="w-5 h-5" />
        </Link>
      </div>
    </m.div>
  );
}
