"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import PageHeader from "@/components/ui/PageHeader";
import OutfitRecommendationCard from "@/components/outfits/OutfitRecommendationCard";
import LoadingState from "@/components/ui/LoadingState";
import EmptyState from "@/components/ui/EmptyState";
import Image from "next/image";

const OCCASIONS = [
  "Casual", "Formal", "Party", "College", "Office",
  "Gym", "Wedding", "Ethnic Function", "Travel", "Daily Wear",
];

const WEATHER_OPTIONS = [
  "Hot", "Cold", "Rainy", "Mild", "Humid",
  "Summer", "Winter", "Monsoon", "All-season",
];

const GENDER_OPTIONS = ["Men", "Women", "Unisex"];

interface WardrobeItem {
  id: string;
  type: string;
  category: string;
  primary_color: string;
  secondary_color?: string;
  brand?: string;
  material?: string;
  front_image_url?: string;
  front_image_key?: string;
  match_score?: number;
  match_reasons?: string[];
}

export default function OutfitAIPage() {
  const router = useRouter();

  // Wardrobe items for selection
  const [wardrobeItems, setWardrobeItems] = useState<WardrobeItem[]>([]);
  const [isLoadingWardrobe, setIsLoadingWardrobe] = useState(true);

  // User selections
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [occasion, setOccasion] = useState("");
  const [weather, setWeather] = useState("");
  const [genderStyle, setGenderStyle] = useState("");

  // Results
  const [result, setResult] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState("");

  // Fetch wardrobe items on mount
  useEffect(() => {
    const fetchWardrobe = async () => {
      try {
        const items = await api.clothing.list();
        setWardrobeItems(Array.isArray(items) ? items : []);
      } catch (err: any) {
        setError(err.message || "Failed to load wardrobe items.");
      } finally {
        setIsLoadingWardrobe(false);
      }
    };
    fetchWardrobe();
  }, []);

  const handleGenerate = async () => {
    try {
      setIsGenerating(true);
      setError("");
      setResult(null);

      const payload: any = {};
      if (selectedItemId) payload.selected_item_id = selectedItemId;
      if (occasion) payload.occasion = occasion;
      if (weather) payload.weather = weather;
      if (genderStyle) payload.gender_style = genderStyle;

      const data = await api.recommendations.generateOutfit(payload);
      setResult(data);
    } catch (err: any) {
      setError(err.message || "Failed to generate recommendation.");
    } finally {
      setIsGenerating(false);
    }
  };

  const renderSelect = (label: string, value: string, onChange: (v: string) => void, options: string[]) => (
    <div>
      <label className="block text-[11px] font-medium text-cloudburst mb-1.5 uppercase tracking-wider">{label}</label>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full bg-inkwell border border-starlight/10 rounded-xl px-4 py-2.5 text-porcelain text-sm focus:outline-none focus:border-cyber-cyan/50 focus:ring-1 focus:ring-cyber-cyan/50 transition-colors"
      >
        <option value="">Any</option>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );

  // ─── Insufficient wardrobe state ───────────────────────────────────
  if (!isLoadingWardrobe && wardrobeItems.length < 2) {
    return (
      <div className="p-6 md:p-10 max-w-7xl mx-auto flex items-center justify-center min-h-[70vh]">
        <EmptyState 
          title="Not Enough Wardrobe Items"
          description="Add more clothing items to your wardrobe to get personalized outfit recommendations. You need at least 2 items to start."
          actionLabel="Upload Item"
          onAction={() => router.push("/upload")}
          icon="👗"
        />
      </div>
    );
  }

  // ─── Main Render ───────────────────────────────────────────────────
  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8">
      
      <PageHeader 
        title="Outfit Intelligence" 
        description="Select an item and let our engine build the perfect outfit."
        badge={{ text: "AI", variant: "cyan" }}
      />

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* ─── Left Panel: Wardrobe Selector ─────────────────────── */}
        <div className="lg:col-span-4 space-y-6">
          <Card variant="translucent" className="p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-glow-cyan opacity-20 pointer-events-none rounded-full blur-2xl -mr-10 -mt-10" />
            <h2 className="text-sm font-medium text-porcelain mb-4 uppercase tracking-wider relative z-10 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-cyber-cyan"></span>
              Your Wardrobe
            </h2>
            
            {isLoadingWardrobe ? (
              <LoadingState message="Loading..." />
            ) : (
              <div className="grid grid-cols-3 gap-2 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar relative z-10">
                {wardrobeItems.map(item => {
                  const isSelected = item.id === selectedItemId;
                  return (
                    <div
                      key={item.id}
                      onClick={() => setSelectedItemId(isSelected ? null : item.id)}
                      className={`
                        relative cursor-pointer rounded-xl border-2 transition-all duration-200 overflow-hidden group
                        ${isSelected
                          ? "border-cyber-cyan shadow-[0_0_15px_rgba(82,225,254,0.2)]"
                          : "border-starlight/10 hover:border-cyber-cyan/50"
                        }
                      `}
                    >
                      {item.front_image_url ? (
                        <div className="relative w-full aspect-[3/4]">
                          <Image src={item.front_image_url} alt={item.type} fill className="object-cover group-hover:scale-105 transition-transform" />
                        </div>
                      ) : (
                        <div className="w-full aspect-[3/4] bg-inkwell flex items-center justify-center">
                          <span className="text-2xl">👕</span>
                        </div>
                      )}
                      <div className="absolute bottom-0 left-0 right-0 bg-carbon/90 backdrop-blur-sm p-1.5 transform translate-y-full group-hover:translate-y-0 transition-transform">
                        <p className="text-[9px] text-porcelain font-medium truncate text-center">{item.type}</p>
                      </div>
                      {isSelected && (
                        <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-cyber-cyan flex items-center justify-center shadow-lg">
                          <span className="text-inkwell text-[10px] font-bold">✓</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {selectedItemId && (
              <p className="text-[11px] text-cyber-cyan mt-4 font-[family-name:var(--font-mono)] relative z-10 bg-cyber-cyan/10 p-2 rounded text-center">
                ✓ Item selected. Click again to deselect.
              </p>
            )}
          </Card>
        </div>

        {/* ─── Right Panel: Filters + Generate ───────────────────── */}
        <div className="lg:col-span-8 space-y-8">
          <Card variant="translucent" className="p-6 md:p-8">
            <h2 className="text-sm font-medium text-porcelain mb-6 uppercase tracking-wider flex items-center gap-2">
              <span className="text-cyber-cyan">✦</span> Parameters
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {renderSelect("Occasion", occasion, setOccasion, OCCASIONS)}
              {renderSelect("Weather / Season", weather, setWeather, WEATHER_OPTIONS)}
              {renderSelect("Gender Style", genderStyle, setGenderStyle, GENDER_OPTIONS)}
            </div>
            <div className="mt-8 border-t border-starlight/10 pt-6">
              <Button
                variant="filled"
                size="lg"
                onClick={handleGenerate}
                disabled={isGenerating}
                className="bg-cyber-cyan text-inkwell font-semibold w-full sm:w-auto min-w-[240px] hover:bg-white"
              >
                {isGenerating ? (
                  <span className="flex items-center gap-2 justify-center">
                    <span className="w-4 h-4 border-2 border-inkwell border-t-transparent rounded-full animate-spin" />
                    Generating Outfit...
                  </span>
                ) : (
                  "✨ Generate Outfit"
                )}
              </Button>
            </div>
          </Card>

          {/* ─── Results ─────────────────────────────────────────── */}
          {result && !result.insufficient_wardrobe && (
            <div className="space-y-8 animate-fade-in-up">
              
              {/* Generated Outfit Combo */}
              <div>
                <h3 className="text-lg font-medium text-porcelain mb-4">Recommended Combination</h3>
                
                {/* Find the top item from the results to pass to the card */}
                <OutfitRecommendationCard 
                  score={result.outfit_score}
                  reason={result.explanation}
                  outfit={{
                    top: result.selected_item?.type?.toLowerCase().includes('shirt') || result.selected_item?.type?.toLowerCase().includes('top') ? result.selected_item : result.best_top_matches?.[0] || result.selected_item,
                    bottom: result.selected_item?.type?.toLowerCase().includes('pant') || result.selected_item?.type?.toLowerCase().includes('jeans') ? result.selected_item : result.best_bottom_matches?.[0],
                    footwear: result.best_footwear_matches?.[0],
                    accessory: result.accessories_suggestions?.[0]
                  }}
                  onSave={() => alert("Outfit saving to be implemented")}
                  onMarkWorn={() => alert("Mark as worn to be implemented")}
                />
              </div>

              {/* Women-Specific Styling */}
              {(result.lipstick_suggestion || result.footwear_type_suggestion || result.accessory_suggestion) && (
                <Card variant="translucent" className="p-6">
                  <h3 className="text-xs font-medium text-cyber-cyan mb-5 uppercase tracking-widest flex items-center gap-2">
                    <span className="text-sm">✨</span> Details
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    {result.lipstick_suggestion && (
                      <div>
                        <p className="text-[11px] text-cloudburst uppercase tracking-wider mb-3">Lipstick</p>
                        <div className="flex flex-wrap gap-2">
                          {result.lipstick_suggestion.map((l: string, i: number) => (
                            <Badge key={i} variant="cyan" className="bg-cyber-cyan/10 border border-cyber-cyan/20 px-2 py-1">{l}</Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    {result.footwear_type_suggestion && (
                      <div>
                        <p className="text-[11px] text-cloudburst uppercase tracking-wider mb-3">Footwear Style</p>
                        <div className="flex flex-wrap gap-2">
                          {result.footwear_type_suggestion.map((f: string, i: number) => (
                            <Badge key={i} variant="cyan" className="bg-cyber-cyan/10 border border-cyber-cyan/20 px-2 py-1">{f}</Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    {result.accessory_suggestion && (
                      <div>
                        <p className="text-[11px] text-cloudburst uppercase tracking-wider mb-3">Accessories</p>
                        <div className="flex flex-wrap gap-2">
                          {result.accessory_suggestion.map((a: string, i: number) => (
                            <Badge key={i} variant="cyan" className="bg-cyber-cyan/10 border border-cyber-cyan/20 px-2 py-1">{a}</Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
              )}

              {/* Avoid Combinations */}
              {result.avoid_combinations?.length > 0 && (
                <Card variant="translucent" className="p-6 border border-red-500/20 bg-red-500/5">
                  <h3 className="text-xs font-medium text-red-400 mb-5 uppercase tracking-widest flex items-center gap-2">
                    <span className="text-sm">⚠</span> Avoid These Combinations
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {result.avoid_combinations.map((avoid: any, i: number) => (
                      <div key={i} className="flex items-start gap-3 p-4 bg-carbon rounded-xl border border-red-500/10 shadow-sm">
                        <span className="text-red-400 text-xl mt-0.5">✕</span>
                        <div>
                          <p className="text-sm text-porcelain font-medium">
                            {avoid.item?.primary_color} {avoid.item?.type}
                          </p>
                          <p className="text-xs text-cloudburst mt-1.5 leading-relaxed">{avoid.reason}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              )}
            </div>
          )}

          {/* Insufficient wardrobe result */}
          {result && result.insufficient_wardrobe && (
            <Card variant="translucent" className="p-10 text-center animate-fade-in-up">
              <div className="text-5xl mb-4">📦</div>
              <h3 className="text-xl text-porcelain font-medium mb-2">Not Enough Items</h3>
              <p className="text-sm text-cloudburst mb-6 max-w-md mx-auto">{result.explanation}</p>
              <Button variant="filled" onClick={() => router.push("/upload")} className="bg-cyber-cyan text-carbon font-medium">
                Upload Cloth
              </Button>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
