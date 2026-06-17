import { useWearTracking } from "@/hooks/use-wear-tracking";
import { History, Plus } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { m } from "framer-motion";
import { fadeUp } from "@/lib/animations";
import { format, parseISO } from "date-fns";

export function RecentOutfitHistoryWidget() {
  const { historyQuery } = useWearTracking();

  if (historyQuery.isLoading || !historyQuery.data) return null;

  const history = historyQuery.data.data;

  if (history.length === 0) return null; // Only show if they have history

  const recentEvents = history.slice(0, 3); // Top 3

  return (
    <m.div variants={fadeUp}>
      <div className="flex items-center justify-between mt-4 mb-6">
        <h2 className="text-2xl font-semibold text-white tracking-tight">Recent Outfit History</h2>
        <Link href="/outfit-history" className="text-sm font-medium text-brand-purple hover:text-purple-400 transition-colors flex items-center gap-1">
          View Timeline <span className="text-base">→</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {recentEvents.map((group) => (
          <div key={group.wear_group_id} className="bg-surface-1/70 backdrop-blur-xl border border-white/5 rounded-2xl p-5 hover:border-white/10 transition-colors">
            <div className="flex justify-between items-center mb-4">
              <div className="text-sm font-medium text-white">
                {format(parseISO(group.worn_at), "MMM d, yyyy")}
              </div>
              <div className="text-xs text-slate-400">
                {group.source_type}
              </div>
            </div>
            
            <div className="flex -space-x-3 overflow-hidden">
              {group.items.slice(0, 4).map((item, i) => (
                <div key={item.id} className={`w-10 h-10 rounded-full border-2 border-surface-1 bg-surface-2 relative overflow-hidden z-[${4-i}]`}>
                  {item.image_url ? (
                    <Image src={item.image_url} alt={item.name} fill className="object-cover" unoptimized />
                  ) : (
                    <div className="w-full h-full bg-white/5" />
                  )}
                </div>
              ))}
              {group.items.length > 4 && (
                <div className="w-10 h-10 rounded-full border-2 border-surface-1 bg-surface-2 flex items-center justify-center text-xs font-bold text-white z-0">
                  +{group.items.length - 4}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </m.div>
  );
}
