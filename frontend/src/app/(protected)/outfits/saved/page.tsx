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
import { Bookmark, CheckCircle2, Shirt } from "lucide-react";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import Image from "next/image";

export default function SavedOutfitsPage() {
  const [outfits, setOutfits] = useState<SavedOutfit[]>([]);
  const [loading, setLoading] = useState(true);
  const [markingWorn, setMarkingWorn] = useState<string | null>(null);
  const { showToast } = useToast();

  const fetchOutfits = async () => {
    try {
      const res = await api.get("/outfits/saved");
      setOutfits(res.data);
    } catch {
      showToast("Failed to fetch saved outfits.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchOutfits();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    } catch {
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {outfits.map(outfit => (
            <Card key={outfit.id}>
              <CardHeader className="flex flex-row items-start justify-between gap-3">
                <div className="min-w-0">
                  <CardTitle className="truncate">{outfit.name}</CardTitle>
                  <p className="text-[11px] text-cloudburst mt-1.5">{formatDate(outfit.created_at)}</p>
                </div>
                {outfit.occasion && (
                  <span className="text-[11px] px-2.5 py-1 bg-surface-raised border border-border-subtle rounded-lg text-cloudburst shrink-0 capitalize">
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
                  <p className="text-xs text-cloudburst line-clamp-2 italic border-l-2 border-border-default pl-3 leading-relaxed">&ldquo;{outfit.notes}&rdquo;</p>
                )}
              </CardContent>
              <CardFooter className="justify-end">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => markAsWorn(outfit)}
                  isLoading={markingWorn === outfit.id}
                >
                  <CheckCircle2 className="mr-2 h-3.5 w-3.5" /> Mark as Worn
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
  if (!item) return <div className="aspect-[3/4] bg-surface/50 rounded-lg border border-dashed border-border-default" />;
  
  return (
    <div className="aspect-[3/4] bg-surface-raised rounded-lg overflow-hidden relative border border-border-subtle group">
      {item.front_image_url && (
        <Image src={item.front_image_url} alt={item.type} fill unoptimized sizes="(max-width: 640px) 25vw, 15vw" className="object-cover" />
      )}
      {!item.front_image_url && (
        <div className="w-full h-full flex items-center justify-center">
          <Shirt className="h-5 w-5 text-white/10" />
        </div>
      )}
      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity p-1">
        <p className="text-[10px] text-center font-medium leading-tight">{item.type}</p>
      </div>
    </div>
  );
}
