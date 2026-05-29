"use client";

import { useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Spinner } from "@/components/ui/Spinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { useToast } from "@/hooks/useToast";
import api from "@/lib/api";
import { OutfitRecommendationResponse, RecommendedItem } from "@/lib/types";
import { Sparkles, Save, Info, TriangleAlert, Shirt } from "lucide-react";

export default function RecommendationsPage() {
  const [occasion, setOccasion] = useState("");
  const [weather, setWeather] = useState("");
  const [recommendation, setRecommendation] = useState<OutfitRecommendationResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [outfitName, setOutfitName] = useState("");
  const { showToast } = useToast();

  const generateOutfit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setRecommendation(null);
    try {
      const res = await api.post("/recommendations/outfit", {
        occasion: occasion || undefined,
        weather: weather || undefined
      });
      setRecommendation(res.data);
    } catch (error: any) {
      showToast(error.response?.data?.detail || "Failed to generate outfit.", "error");
    } finally {
      setLoading(false);
    }
  };

  const saveOutfit = async () => {
    if (!recommendation || !outfitName) return;
    setSaving(true);
    try {
      await api.post("/outfits/", {
        name: outfitName,
        occasion: occasion || null,
        top_item_id: recommendation.best_top_matches[0]?.id || null,
        bottom_item_id: recommendation.best_bottom_matches[0]?.id || null,
        footwear_item_id: recommendation.best_footwear_matches[0]?.id || null,
        accessory_item_id: recommendation.accessories_suggestions[0]?.id || null,
        notes: recommendation.explanation
      });
      showToast("Outfit saved successfully!", "success");
      setOutfitName("");
    } catch (error: any) {
      showToast("Failed to save outfit.", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <PageHeader 
        title="AI Outfit Recommender" 
        description="Let Gemini AI build the perfect outfit from your wardrobe based on current conditions."
      />

      <Card className="mb-8">
        <CardContent className="p-6">
          <form onSubmit={generateOutfit} className="flex flex-col md:flex-row gap-4 items-end">
            <Input 
              label="Occasion (Optional)"
              placeholder="e.g. Office, Date Night, Gym"
              value={occasion}
              onChange={(e) => setOccasion(e.target.value)}
            />
            <Input 
              label="Weather / Location (Optional)"
              placeholder="e.g. Hot, Rainy, New York"
              value={weather}
              onChange={(e) => setWeather(e.target.value)}
            />
            <Button type="submit" className="w-full md:w-auto" isLoading={loading}>
              <Sparkles className="mr-2 h-4 w-4" /> Generate
            </Button>
          </form>
        </CardContent>
      </Card>

      {loading && (
        <div className="py-20 flex flex-col items-center">
          <Spinner size="lg" className="mb-4" />
          <p className="text-cloudburst">Analyzing your wardrobe combinations...</p>
        </div>
      )}

      {recommendation && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
          {recommendation.insufficient_wardrobe && (
            <div className="bg-code-orange/10 border border-code-orange/30 p-4 rounded-xl flex gap-3 text-code-orange">
              <TriangleAlert className="h-5 w-5 shrink-0" />
              <div>
                <p className="font-medium">Insufficient Wardrobe</p>
                <p className="text-sm opacity-90">You don't have enough items in your digital wardrobe to build a complete outfit. Showing partial results.</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Suggested Combination</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <OutfitSlot title="Top" item={recommendation.best_top_matches[0]} />
                    <OutfitSlot title="Bottom" item={recommendation.best_bottom_matches[0]} />
                    <OutfitSlot title="Footwear" item={recommendation.best_footwear_matches[0]} />
                    <OutfitSlot title="Accessory" item={recommendation.accessories_suggestions[0]} />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-cyber-cyan" /> Stylist Reasoning
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-cloudburst leading-relaxed">{recommendation.explanation}</p>
                </CardContent>
              </Card>
            </div>

            <div>
              <Card className="sticky top-4">
                <CardHeader>
                  <CardTitle>Save Outfit</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Input 
                    label="Outfit Name"
                    placeholder="e.g. Summer Office Look"
                    value={outfitName}
                    onChange={(e) => setOutfitName(e.target.value)}
                  />
                  <Button 
                    className="w-full" 
                    onClick={saveOutfit} 
                    disabled={!outfitName}
                    isLoading={saving}
                  >
                    <Save className="mr-2 h-4 w-4" /> Save to Favorites
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function OutfitSlot({ title, item }: { title: string, item?: RecommendedItem }) {
  return (
    <div>
      <p className="text-xs font-medium text-cloudburst mb-2 uppercase tracking-wider">{title}</p>
      <div className="aspect-[3/4] bg-charcoal/80 rounded-xl border border-white/5 overflow-hidden flex items-center justify-center relative">
        {item ? (
          item.front_image_url ? (
            <img src={item.front_image_url} alt={item.type} className="w-full h-full object-cover" />
          ) : (
            <Shirt className="h-8 w-8 text-white/20" />
          )
        ) : (
          <p className="text-xs text-white/20">Empty</p>
        )}
        {item && (
          <div className="absolute bottom-0 inset-x-0 bg-black/80 p-2">
            <p className="text-xs text-porcelain truncate font-medium">{item.type}</p>
          </div>
        )}
      </div>
    </div>
  );
}
