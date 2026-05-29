"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
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
    <div className="min-h-screen bg-charcoal p-8 pb-20">
      <div className="max-w-6xl mx-auto space-y-8">
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-medium text-porcelain">Saved Outfits</h1>
            <p className="text-cloudburst mt-1">Your favorite combinations.</p>
          </div>
          <Button variant="filled" onClick={() => router.push("/outfit-ai")}>Generate New</Button>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl">
            {error}
          </div>
        )}

        {loading && !error && (
          <div className="text-center py-10 text-cloudburst animate-pulse">Loading saved outfits...</div>
        )}

        {!loading && outfits.length === 0 && !error && (
          <Card variant="basic" className="p-12 text-center border-dashed border-starlight/20">
            <h3 className="text-xl text-porcelain mb-2">No saved outfits yet</h3>
            <p className="text-cloudburst mb-6">Use the AI recommendation engine to find and save your favorite looks.</p>
            <Button variant="ghost" className="border border-cyber-cyan text-cyber-cyan" onClick={() => router.push("/outfit-ai")}>
              Try Outfit AI
            </Button>
          </Card>
        )}

        {!loading && outfits.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {outfits.map((outfit) => (
              <Card key={outfit.id} variant="translucent" className="p-5 flex flex-col h-full border border-starlight/10 hover:border-cyber-cyan/30 transition-all">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-medium text-porcelain truncate pr-2">{outfit.name}</h3>
                  <div className="flex flex-col gap-1 items-end shrink-0">
                    {outfit.occasion && <Badge variant="cyan">{outfit.occasion}</Badge>}
                    {outfit.season && <Badge variant="default">{outfit.season}</Badge>}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 mb-4 flex-grow">
                  {[outfit.top_item, outfit.bottom_item, outfit.footwear_item, outfit.accessory_item].map((item, idx) => {
                    if (!item) return null;
                    return (
                      <div key={item.id + idx} className="bg-carbon rounded-lg p-2 border border-starlight/5 flex flex-col items-center text-center">
                        {item.front_image_url ? (
                          <div className="relative w-full aspect-square mb-2 rounded overflow-hidden">
                            <Image 
                              src={item.front_image_url} 
                              alt={item.category}
                              fill
                              className="object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-full aspect-square mb-2 rounded bg-inkwell flex items-center justify-center text-2xl">
                            👕
                          </div>
                        )}
                        <p className="text-xs text-porcelain truncate w-full">{item.category}</p>
                        <p className="text-[10px] text-cloudburst truncate w-full">{item.primary_color}</p>
                      </div>
                    );
                  })}
                </div>

                {outfit.notes && (
                  <div className="mt-auto bg-inkwell/50 p-3 rounded text-sm text-cloudburst border border-starlight/5">
                    "{outfit.notes}"
                  </div>
                )}
                
                <div className="mt-4 pt-4 border-t border-starlight/10 flex justify-between items-center text-xs text-cloudburst">
                  <span>Saved: {new Date(outfit.created_at).toLocaleDateString()}</span>
                  <Button variant="ghost" className="h-6 px-2 text-cyber-cyan border-cyber-cyan/20 hover:bg-cyber-cyan/10">Mark Worn</Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
