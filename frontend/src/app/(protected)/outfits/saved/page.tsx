"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { useToast } from "@/hooks/useToast";
import api from "@/lib/api";
import { SavedOutfit, ClothingItemSummary } from "@/lib/types";
import { Bookmark, CheckCircle2, Calendar } from "lucide-react";
import { formatDate } from "@/lib/utils";
import Link from "next/link";

export default function SavedOutfitsPage() {
  const [outfits, setOutfits] = useState<SavedOutfit[]>([]);
  const [loading, setLoading] = useState(true);
  const [markingWorn, setMarkingWorn] = useState<string | null>(null);
  const { showToast } = useToast();

  const fetchOutfits = async () => {
    try {
      const res = await api.get("/outfits/");
      setOutfits(res.data);
    } catch (error) {
      showToast("Failed to fetch saved outfits.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOutfits();
  }, []);

  const markAsWorn = async (outfit: SavedOutfit) => {
    setMarkingWorn(outfit.id);
    try {
      await api.post(`/outfits/mark-worn`, {
        top_item_id: outfit.top_item?.id || null,
        bottom_item_id: outfit.bottom_item?.id || null,
        footwear_item_id: outfit.footwear_item?.id || null,
        accessory_item_id: outfit.accessory_item?.id || null,
        occasion: outfit.occasion,
        notes: "Marked from saved outfits dashboard"
      });
      showToast(`Marked "${outfit.name}" as worn today!`, "success");
    } catch (error) {
      showToast("Failed to update wear history.", "error");
    } finally {
      setMarkingWorn(null);
    }
  };

  return (
    <div>
      <PageHeader 
        title="Saved Outfits" 
        description="Your favorite AI-generated clothing combinations."
        action={
          <Link href="/outfits/recommendations">
            <Button>Generate New</Button>
          </Link>
        }
      />

      {loading ? (
        <div className="py-20 flex justify-center"><Spinner size="lg" /></div>
      ) : outfits.length === 0 ? (
        <EmptyState 
          icon={<Bookmark className="h-10 w-10" />}
          title="No saved outfits"
          description="You haven't saved any outfit recommendations yet."
          action={
            <Link href="/outfits/recommendations"><Button>Get Recommendations</Button></Link>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {outfits.map(outfit => (
            <Card key={outfit.id}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                  <CardTitle>{outfit.name}</CardTitle>
                  <p className="text-xs text-cloudburst mt-1">Saved on {formatDate(outfit.created_at)}</p>
                </div>
                {outfit.occasion && (
                  <span className="text-xs px-2 py-1 bg-white/5 border border-white/10 rounded-full text-cloudburst">
                    {outfit.occasion}
                  </span>
                )}
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 gap-2 mb-4">
                  <MiniSlot item={outfit.top_item} />
                  <MiniSlot item={outfit.bottom_item} />
                  <MiniSlot item={outfit.footwear_item} />
                  <MiniSlot item={outfit.accessory_item} />
                </div>
                {outfit.notes && (
                  <p className="text-sm text-cloudburst line-clamp-2 italic border-l-2 border-white/10 pl-3">"{outfit.notes}"</p>
                )}
              </CardContent>
              <CardFooter className="justify-end bg-transparent border-t-0 pt-0">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => markAsWorn(outfit)}
                  isLoading={markingWorn === outfit.id}
                >
                  <CheckCircle2 className="mr-2 h-4 w-4" /> Mark as Worn Today
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function MiniSlot({ item }: { item?: ClothingItemSummary }) {
  if (!item) return <div className="aspect-[3/4] bg-charcoal/50 rounded-lg border border-white/5 border-dashed" />;
  
  return (
    <div className="aspect-[3/4] bg-charcoal rounded-lg overflow-hidden relative border border-white/5 group">
      {item.front_image_url && (
        <img src={item.front_image_url} alt={item.type} className="w-full h-full object-cover" />
      )}
      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity p-1">
        <p className="text-[10px] text-center font-medium leading-tight">{item.type}</p>
      </div>
    </div>
  );
}
