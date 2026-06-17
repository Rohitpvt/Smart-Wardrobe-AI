"use client";

import { useDailyStylist } from "@/hooks/use-daily-stylist";
import { m } from "framer-motion";
import { fadeUp, staggerContainer as stagger } from "@/lib/animations";
import { Loader2, Flame, Sun, CloudRain, Cloud, Lightbulb, Target, Sparkles, Shirt } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

function WeatherIcon({ condition, temp }: { condition: string | null, temp: number | null }) {
  if (!condition) return <Cloud className="w-6 h-6 text-slate-400" />;
  const c = condition.toLowerCase();
  if (c.includes('rain')) return <CloudRain className="w-6 h-6 text-blue-400" />;
  if (c.includes('cloud')) return <Cloud className="w-6 h-6 text-slate-300" />;
  if (temp && temp > 25) return <Sun className="w-6 h-6 text-amber-400" />;
  return <Sun className="w-6 h-6 text-amber-400" />;
}

export default function DailyStylistClient() {
  const { briefQuery } = useDailyStylist();

  if (briefQuery.isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-brand-blue" />
        <p className="text-slate-400 animate-pulse">Generating your personalized daily brief...</p>
      </div>
    );
  }

  const res = briefQuery.data;

  if (res && !res.success) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-brand-purple/10 flex items-center justify-center mb-2">
          <Shirt className="w-8 h-8 text-brand-purple" />
        </div>
        <h2 className="text-2xl font-bold text-white">Let's Build Your Wardrobe</h2>
        <p className="text-slate-400 max-w-md">
          {res.message || "We need a few more wardrobe items before creating highly personalized daily briefings."}
        </p>
        <Link 
          href="/dashboard/wardrobe/upload"
          className="px-6 py-3 bg-brand-blue hover:bg-brand-blue/90 text-white rounded-xl font-medium transition-colors shadow-[0_0_20px_rgba(59,130,246,0.3)]"
        >
          Add Clothing Items
        </Link>
      </div>
    );
  }

  const brief = res?.brief;
  if (!brief) return null;

  const { recommended_outfit, weather, style_tip, daily_insight, confidence, consecutive_days } = brief;

  return (
    <m.div initial="hidden" animate="visible" variants={stagger} className="max-w-6xl mx-auto space-y-8 pb-16">
      
      {/* HEADER */}
      <m.div variants={fadeUp} className="flex flex-col md:flex-row md:items-end justify-between gap-6 relative z-10">
        <div>
          <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight mb-3">Today's Brief</h1>
          <p className="text-lg text-slate-400">
            {new Date(brief.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="bg-orange-500/10 border border-orange-500/20 px-4 py-2 rounded-2xl flex items-center gap-2">
            <Flame className="w-5 h-5 text-orange-400" />
            <span className="font-bold text-orange-400">{consecutive_days} Day Streak</span>
          </div>
          <div className="bg-brand-purple/10 border border-brand-purple/20 px-4 py-2 rounded-2xl flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-brand-purple" />
            <span className="font-bold text-brand-purple">{confidence}% Match</span>
          </div>
        </div>
      </m.div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COL: THE OUTFIT */}
        <div className="lg:col-span-7 space-y-6">
          <m.div variants={fadeUp} className="bg-surface-1/70 backdrop-blur-xl border border-white/10 rounded-[2rem] p-8 shadow-[0_0_50px_rgba(59,130,246,0.05)] relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-[200px] bg-gradient-to-b from-brand-blue/5 to-transparent pointer-events-none" />
            
            <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
              <Shirt className="w-5 h-5 text-brand-blue" />
              Recommended Outfit
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 relative z-10">
              {[recommended_outfit.top, recommended_outfit.bottom, recommended_outfit.shoes].map((item, idx) => (
                <div key={idx} className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden group/item hover:bg-white/10 transition-colors">
                  <div className="aspect-square relative bg-white/5">
                    {item.image_url ? (
                      <Image 
                        src={item.image_url} 
                        alt={item.name} 
                        fill 
                        className="object-cover mix-blend-screen opacity-90 group-hover/item:scale-105 transition-transform duration-500"
                        unoptimized
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Shirt className="w-8 h-8 text-white/20" />
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <p className="text-sm font-medium text-white truncate">{item.name}</p>
                  </div>
                </div>
              ))}
              {recommended_outfit.outerwear && (
                <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden group/item hover:bg-white/10 transition-colors">
                  <div className="aspect-square relative bg-white/5">
                    {recommended_outfit.outerwear.image_url && (
                      <Image 
                        src={recommended_outfit.outerwear.image_url} 
                        alt={recommended_outfit.outerwear.name} 
                        fill 
                        className="object-cover mix-blend-screen opacity-90 group-hover/item:scale-105 transition-transform duration-500"
                        unoptimized
                      />
                    )}
                  </div>
                  <div className="p-3">
                    <p className="text-sm font-medium text-white truncate">{recommended_outfit.outerwear.name}</p>
                    <p className="text-xs text-brand-blue mt-0.5">Outerwear</p>
                  </div>
                </div>
              )}
            </div>
          </m.div>
        </div>

        {/* RIGHT COL: CONTEXT & TIPS */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* WEATHER CARD */}
          <m.div variants={fadeUp} className="bg-surface-1 border border-white/5 rounded-3xl p-6">
            <h3 className="text-sm font-label-md text-slate-500 uppercase tracking-wider mb-4">Weather Context</h3>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center">
                <WeatherIcon condition={weather.condition} temp={weather.temperature} />
              </div>
              <div>
                <div className="text-3xl font-bold text-white">
                  {weather.temperature !== null ? `${Math.round(weather.temperature)}°` : '--'}
                </div>
                <div className="text-slate-400 capitalize">{weather.condition || "Unknown"}</div>
              </div>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed bg-white/5 p-3 rounded-xl border border-white/5">
              {weather.notes}
            </p>
          </m.div>

          {/* STYLE TIP CARD */}
          <m.div variants={fadeUp} className="bg-gradient-to-br from-brand-purple/10 to-transparent border border-brand-purple/20 rounded-3xl p-6 relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-brand-purple/20 rounded-full blur-2xl group-hover:bg-brand-purple/30 transition-colors" />
            <h3 className="text-sm font-label-md text-brand-purple uppercase tracking-wider mb-3 flex items-center gap-2">
              <Lightbulb className="w-4 h-4" />
              Styling Tip
            </h3>
            <p className="text-white font-medium leading-relaxed relative z-10">
              {style_tip}
            </p>
          </m.div>

          {/* INSIGHT CARD */}
          <m.div variants={fadeUp} className="bg-surface-1 border border-white/5 rounded-3xl p-6">
            <h3 className="text-sm font-label-md text-brand-blue uppercase tracking-wider mb-3 flex items-center gap-2">
              <Target className="w-4 h-4" />
              Daily Insight
            </h3>
            <p className="text-slate-300 text-sm leading-relaxed">
              {daily_insight}
            </p>
          </m.div>

        </div>

      </div>

    </m.div>
  );
}
