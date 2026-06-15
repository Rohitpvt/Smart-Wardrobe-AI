import { m } from "framer-motion";
import { fadeUp } from "@/lib/animations";
import { IntelligenceFeedItem } from "@/types/intelligence";
import { Bell, Zap, BrainCircuit, ArrowUpRight, Filter } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useState } from "react";

interface Props {
  items: IntelligenceFeedItem[];
}

export function IntelligenceFeedCard({ items }: Props) {
  const [activeFilter, setActiveFilter] = useState<string>("All");

  if (items.length === 0) return null;

  const categories = ["All", ...Array.from(new Set(items.map(item => item.feed_category || "operational")))];
  
  const filteredItems = activeFilter === "All" 
    ? items 
    : items.filter(item => (item.feed_category || "operational") === activeFilter);

  return (
    <m.div variants={fadeUp} className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md relative overflow-hidden h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <Zap className="w-5 h-5 text-brand-purple" />
          Intelligence Feed
        </h3>
        <span className="text-xs font-medium px-2 py-1 bg-brand-purple/20 text-brand-purple rounded-md">Live</span>
      </div>

      <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-2 custom-scrollbar hide-scrollbar-thumb">
        <Filter className="w-4 h-4 text-white/40 mr-1" />
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveFilter(cat)}
            className={cn(
              "px-3 py-1 rounded-full text-xs font-medium transition-colors whitespace-nowrap",
              activeFilter === cat 
                ? "bg-white/20 text-white" 
                : "bg-white/5 text-white/50 hover:bg-white/10 hover:text-white/80"
            )}
          >
            {cat.charAt(0).toUpperCase() + cat.slice(1)}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-4 overflow-y-auto custom-scrollbar flex-1 pr-2">
        {filteredItems.map((item) => {
          const Icon = item.item_type === "alert" ? Bell : BrainCircuit;
          return (
            <div key={item.id} className="group flex items-start gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors">
              <div className={cn(
                "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5",
                item.item_type === "alert" ? "bg-red-500/10 text-red-400" : "bg-brand-blue/10 text-brand-blue"
              )}>
                <Icon className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-white/90 leading-snug">{item.content}</p>
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-[10px] text-white/40 uppercase tracking-wider font-medium">
                    Impact: {item.impact_score.toFixed(0)}
                  </span>
                  <span className="text-[10px] text-brand-purple/60 uppercase tracking-wider font-medium flex items-center gap-1">
                    Conf: {item.confidence_score?.toFixed(0) || 80}%
                  </span>
                  {item.source_services && item.source_services.length > 0 && (
                    <span className="text-[10px] text-white/30 uppercase tracking-wider hidden sm:inline-block">
                      • {item.source_services[0].replace(/_/g, " ")}
                    </span>
                  )}
                </div>
              </div>
              {item.action_payload && (
                <Link href={item.action_payload.action === "view_underutilized" ? "/dashboard" : "#"}>
                  <button className="opacity-0 group-hover:opacity-100 p-1.5 rounded-md bg-white/5 hover:bg-white/10 text-white transition-all">
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </Link>
              )}
            </div>
          );
        })}
      </div>
    </m.div>
  );
}
