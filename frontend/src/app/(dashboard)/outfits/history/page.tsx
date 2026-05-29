"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
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
    <div className="min-h-screen bg-charcoal p-8 pb-20">
      <div className="max-w-4xl mx-auto space-y-8">
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-medium text-porcelain">Outfit History</h1>
            <p className="text-cloudburst mt-1">A timeline of what you wore.</p>
          </div>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl">
            {error}
          </div>
        )}

        {loading && !error && (
          <div className="text-center py-10 text-cloudburst animate-pulse">Loading history...</div>
        )}

        {!loading && history.length === 0 && !error && (
          <Card variant="basic" className="p-12 text-center border-dashed border-starlight/20">
            <h3 className="text-xl text-porcelain mb-2">No history found</h3>
            <p className="text-cloudburst mb-6">You haven't marked any outfits as worn yet.</p>
          </Card>
        )}

        {!loading && history.length > 0 && (
          <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-starlight/20 before:to-transparent">
            {history.map((entry, index) => {
              const dateObj = new Date(entry.worn_date);
              
              return (
                <div key={entry.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  {/* Timeline Marker */}
                  <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-charcoal bg-cyber-cyan text-charcoal shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                    ✓
                  </div>
                  
                  {/* Card Content */}
                  <Card variant="translucent" className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-5 border border-starlight/10 hover:border-starlight/30 transition-colors">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-sm font-medium text-porcelain bg-carbon px-2 py-1 rounded border border-starlight/5">
                        {dateObj.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                      </span>
                      <div className="flex gap-2">
                        {entry.weather && <Badge variant="cyan">{entry.weather}</Badge>}
                        {entry.rating && <Badge variant="orange">★ {entry.rating}/5</Badge>}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-3">
                      {[entry.top_item, entry.bottom_item, entry.footwear_item, entry.accessory_item].map((item, idx) => {
                        if (!item) return null;
                        return (
                          <span key={item.id + idx} className="text-xs text-cloudburst bg-inkwell px-2 py-1 rounded border border-starlight/5">
                            {item.primary_color} {item.category}
                          </span>
                        );
                      })}
                    </div>

                    {entry.occasion && (
                      <p className="text-sm text-porcelain mb-2">
                        <span className="text-cloudburst">Occasion:</span> {entry.occasion}
                      </p>
                    )}

                    {entry.notes && (
                      <p className="text-sm text-cloudburst italic border-l-2 border-cyber-cyan/30 pl-3 py-1">
                        "{entry.notes}"
                      </p>
                    )}
                  </Card>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
