"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import PageHeader from "@/components/ui/PageHeader";
import LoadingState from "@/components/ui/LoadingState";
import EmptyState from "@/components/ui/EmptyState";
import api from "@/lib/api";

export default function OutfitHistoryPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (isAuthenticated) {
      api.outfits.getHistory()
        .then((data) => {
          setHistory(data);
          setLoading(false);
        })
        .catch((err) => {
          console.error(err);
          setError("Failed to load outfit history.");
          setLoading(false);
        });
    }
  }, [isAuthenticated]);

  if (authLoading || !isAuthenticated) return null;

  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto space-y-8">
      
      <PageHeader 
        title="Outfit History" 
        description="A timeline of what you wore and when."
      />

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-sm">
          {error}
        </div>
      )}

      {loading && !error && (
        <LoadingState message="Loading history..." />
      )}

      {!loading && history.length === 0 && !error && (
        <EmptyState 
          title="No history found"
          description="You haven't marked any outfits as worn yet. Generate and wear outfits to build your history."
          actionLabel="Generate Outfit"
          onAction={() => router.push("/outfit-ai")}
          icon="📅"
        />
      )}

      {!loading && history.length > 0 && (
        <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-starlight/20 before:to-transparent animate-fade-in-up">
          {history.map((entry, index) => {
            const dateObj = new Date(entry.worn_date);
            
            return (
              <div key={entry.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                {/* Timeline Marker */}
                <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-charcoal bg-cyber-cyan shadow-[0_0_15px_rgba(82,225,254,0.3)] shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 text-charcoal font-bold">
                  ✓
                </div>
                
                {/* Card Content */}
                <Card variant="translucent" className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-6 border border-starlight/10 hover:border-cyber-cyan/30 transition-all duration-300">
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-sm font-medium text-porcelain bg-carbon px-3 py-1.5 rounded-lg border border-starlight/10 shadow-subtle-2 font-[family-name:var(--font-mono)]">
                      {dateObj.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                    </span>
                    <div className="flex flex-col gap-1 items-end">
                      {entry.weather && <Badge variant="cyan" className="bg-cyber-cyan/10 border border-cyber-cyan/20">{entry.weather}</Badge>}
                      {entry.rating && <Badge variant="orange" className="bg-code-orange/10 border border-code-orange/20">★ {entry.rating}/5</Badge>}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {[entry.top_item, entry.bottom_item, entry.footwear_item, entry.accessory_item].map((item, idx) => {
                      if (!item) return null;
                      return (
                        <span key={item.id + idx} className="text-xs text-porcelain bg-inkwell px-2.5 py-1.5 rounded-md border border-starlight/5 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: item.primary_color || 'currentColor' }} />
                          {item.category}
                        </span>
                      );
                    })}
                  </div>

                  {entry.occasion && (
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-xs uppercase tracking-widest text-cloudburst">Occasion:</span>
                      <span className="text-sm text-porcelain">{entry.occasion}</span>
                    </div>
                  )}

                  {entry.notes && (
                    <div className="bg-inkwell/50 p-3 rounded-lg text-sm text-cloudburst border-l-2 border-starlight/20 mt-2">
                      <span className="text-cyber-cyan font-[family-name:var(--font-mono)] mr-2">/</span>
                      {entry.notes}
                    </div>
                  )}
                </Card>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
