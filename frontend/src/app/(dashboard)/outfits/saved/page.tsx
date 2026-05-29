"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import PageHeader from "@/components/ui/PageHeader";
import LoadingState from "@/components/ui/LoadingState";
import EmptyState from "@/components/ui/EmptyState";
import api from "@/lib/api";
import Image from "next/image";

export default function SavedOutfitsPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  
  const [outfits, setOutfits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (isAuthenticated) {
      api.outfits.getSaved()
        .then((data) => {
          setOutfits(data);
          setLoading(false);
        })
        .catch((err) => {
          console.error(err);
          setError("Failed to load saved outfits.");
          setLoading(false);
        });
    }
  }, [isAuthenticated]);

  if (authLoading || !isAuthenticated) return null;

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8">
      
      <PageHeader 
        title="Saved Outfits" 
        description="Your favorite clothing combinations."
        actions={
          <Button variant="filled" onClick={() => router.push("/outfit-ai")}>
            ✨ Generate New
          </Button>
        }
      />

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-sm">
          {error}
        </div>
      )}

      {loading && !error && (
        <LoadingState message="Loading saved outfits..." />
      )}

      {!loading && outfits.length === 0 && !error && (
        <EmptyState 
          title="No saved outfits yet"
          description="Use the AI recommendation engine to find and save your favorite looks for easy access."
          actionLabel="Try Outfit AI"
          onAction={() => router.push("/outfit-ai")}
          icon="⭐"
        />
      )}

      {!loading && outfits.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
          {outfits.map((outfit) => (
            <Card key={outfit.id} variant="translucent" className="p-6 flex flex-col h-full border border-starlight/10 hover:border-cyber-cyan/30 transition-all group relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-glow-cyan opacity-0 group-hover:opacity-10 pointer-events-none rounded-full blur-2xl transition-opacity" />
              
              <div className="flex justify-between items-start mb-5 relative z-10">
                <h3 className="text-lg font-medium text-porcelain truncate pr-2">{outfit.name}</h3>
                <div className="flex flex-col gap-1.5 items-end shrink-0">
                  {outfit.occasion && <Badge variant="cyan">{outfit.occasion}</Badge>}
                  {outfit.season && <Badge variant="default">{outfit.season}</Badge>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-5 flex-grow relative z-10">
                {[outfit.top_item, outfit.bottom_item, outfit.footwear_item, outfit.accessory_item].map((item, idx) => {
                  if (!item) return null;
                  return (
                    <div key={item.id + idx} className="bg-carbon rounded-lg p-2.5 border border-starlight/5 flex flex-col items-center text-center hover:border-starlight/20 transition-colors">
                      {item.front_image_url ? (
                        <div className="relative w-full aspect-square mb-2.5 rounded overflow-hidden">
                          <Image 
                            src={item.front_image_url} 
                            alt={item.category}
                            fill
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-full aspect-square mb-2.5 rounded bg-inkwell flex items-center justify-center text-2xl">
                          👕
                        </div>
                      )}
                      <p className="text-[11px] font-medium text-porcelain truncate w-full">{item.category}</p>
                      <p className="text-[9px] text-cloudburst truncate w-full uppercase tracking-widest mt-0.5">{item.primary_color}</p>
                    </div>
                  );
                })}
              </div>

              {outfit.notes && (
                <div className="mt-auto bg-inkwell/50 p-3 rounded-lg text-sm text-cloudburst border-l-2 border-starlight/20 relative z-10">
                  <span className="text-cyber-cyan font-[family-name:var(--font-mono)] mr-2">/</span>
                  {outfit.notes}
                </div>
              )}
              
              <div className="mt-5 pt-4 border-t border-starlight/10 flex justify-between items-center text-xs text-cloudburst relative z-10">
                <span className="font-[family-name:var(--font-mono)] text-[10px] uppercase">
                  Saved: {new Date(outfit.created_at).toLocaleDateString()}
                </span>
                <Button variant="ghost-cyan" size="sm" className="h-7 text-xs border border-cyber-cyan/30 bg-cyber-cyan/5 hover:bg-cyber-cyan/10">
                  Mark Worn
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
