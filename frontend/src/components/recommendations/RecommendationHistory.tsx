"use client";
import { useState } from "react";
import { toast } from "sonner";
import { useRecommendations } from "@/hooks/use-recommendations";
import { OutfitCard } from "./OutfitCard";
import { EmptyWardrobeState } from "./EmptyWardrobeState";
import { m, AnimatePresence } from "framer-motion";
import { History, ChevronLeft, ChevronRight } from "lucide-react";
import { GlassPanel } from "@/components/ui/GlassPanel";

export function RecommendationHistory() {
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const { query, deleteMutation } = useRecommendations(page, pageSize);
  const { data, isLoading, error } = query;

  const handleDelete = (id: string) => {
    toast.error("Are you sure you want to delete this recommendation?", {
      action: {
        label: "Delete",
        onClick: () => deleteMutation.mutate(id),
      },
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-8 mt-12">
        <div className="flex items-center gap-3 border-b border-white/10 pb-4">
          <History className="w-5 h-5 text-slate-500" />
          <h3 className="text-xl font-bold text-white tracking-tight">Recent Recommendations</h3>
        </div>
        <div className="space-y-12">
          {[...Array(3)].map((_, i) => (
            <GlassPanel key={i} className="p-8">
              <div className="flex justify-between items-start mb-8">
                <div className="space-y-3 w-full max-w-sm">
                  <div className="h-8 bg-white/10 rounded-lg w-2/3"></div>
                  <div className="h-5 bg-white/10 rounded-md w-1/3"></div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="aspect-[3/4] bg-surface-2 rounded-2xl border border-white/5"></div>
                <div className="aspect-[3/4] bg-surface-2 rounded-2xl border border-white/5"></div>
                <div className="aspect-[3/4] bg-surface-2 rounded-2xl border border-white/5"></div>
              </div>
            </GlassPanel>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-16 text-red-400 bg-surface-1/70 rounded-2xl border border-white/10 backdrop-blur-xl mt-12 shadow-sm">
        <div className="w-16 h-16 rounded-xl bg-red-500/10 mx-auto flex items-center justify-center mb-4">
          <span className="text-2xl">⚠️</span>
        </div>
        <h3 className="text-xl font-semibold mb-2">Failed to load history</h3>
        <p className="text-red-300/80">Please refresh the page or try again later.</p>
      </div>
    );
  }

  if (!data || data.data.length === 0) {
    return (
      <div className="mt-12">
        <EmptyWardrobeState message="No recommendations yet" />
      </div>
    );
  }

  return (
    <m.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8 mt-12"
    >
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <History className="w-5 h-5 text-brand-blue" />
          <h3 className="text-xl md:text-2xl font-bold text-white tracking-tight">Your Lookbook</h3>
        </div>
        <span className="text-sm text-slate-500 font-medium bg-surface-2 px-3 py-1 rounded-full border border-white/5">
          {data.pagination.total_items} Outfits Generated
        </span>
      </div>

      <div className="space-y-12 md:space-y-16">
        <AnimatePresence mode="popLayout">
          {data.data.map((rec, index) => (
            <m.div
              key={rec.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
              transition={{ delay: index * 0.1 }}
            >
              <OutfitCard 
                recommendation={rec} 
                onDelete={handleDelete}
                isDeleting={deleteMutation.isPending && deleteMutation.variables === rec.id}
              />
            </m.div>
          ))}
        </AnimatePresence>
      </div>

      {data.pagination.total_pages > 1 && (
        <div className="flex items-center justify-center gap-4 pt-12">
          <button
            onClick={() => {
              setPage((p) => Math.max(1, p - 1));
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            disabled={page === 1}
            className="w-12 h-12 flex items-center justify-center rounded-xl bg-surface-2 border border-white/10 text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-surface-3 hover:text-white transition-all shadow-sm"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          <span className="text-sm font-medium text-slate-400 min-w-[80px] text-center">
            {data.pagination.page} / {data.pagination.total_pages}
          </span>
          
          <button
            onClick={() => {
              setPage((p) => Math.min(data.pagination.total_pages, p + 1));
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            disabled={page === data.pagination.total_pages}
            className="w-12 h-12 flex items-center justify-center rounded-xl bg-surface-2 border border-white/10 text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-surface-3 hover:text-white transition-all shadow-sm"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}
    </m.div>
  );
}
