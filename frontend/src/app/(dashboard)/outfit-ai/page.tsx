"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";

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

  // ─── Render Helpers ────────────────────────────────────────────────

  const renderItemCard = (item: WardrobeItem, isSelected = false) => (
    <div
      key={item.id}
      onClick={() => setSelectedItemId(isSelected ? null : item.id)}
      className={`
        relative cursor-pointer rounded-[12px] border-2 transition-all duration-200 overflow-hidden
        ${isSelected
          ? "border-cyber-cyan shadow-[0_0_15px_rgba(82,225,254,0.2)]"
          : "border-starlight/10 hover:border-starlight/30"
        }
      `}
    >
      {item.front_image_url ? (
        <img
          src={item.front_image_url}
          alt={`${item.primary_color} ${item.type}`}
          className="w-full h-24 object-cover bg-inkwell"
        />
      ) : (
        <div className="w-full h-24 bg-inkwell flex items-center justify-center">
          <span className="text-2xl">👕</span>
        </div>
      )}
      <div className="p-2 bg-carbon">
        <p className="text-[11px] text-porcelain font-medium truncate">{item.type}</p>
        <p className="text-[10px] text-cloudburst truncate">{item.primary_color}</p>
      </div>
      {isSelected && (
        <div className="absolute top-1 right-1 w-5 h-5 rounded-full bg-cyber-cyan flex items-center justify-center">
          <span className="text-inkwell text-[10px] font-bold">✓</span>
        </div>
      )}
    </div>
  );

  const renderRecommendedItem = (item: any, rank?: number) => (
    <div key={item.id} className="bg-inkwell rounded-[12px] border border-starlight/10 overflow-hidden">
      {item.front_image_url ? (
        <img
          src={item.front_image_url}
          alt={`${item.primary_color} ${item.type}`}
          className="w-full h-32 object-cover"
        />
      ) : (
        <div className="w-full h-32 bg-carbon flex items-center justify-center">
          <span className="text-3xl">👔</span>
        </div>
      )}
      <div className="p-3">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm text-porcelain font-medium">{item.primary_color} {item.type}</p>
          <span className="font-[family-name:var(--font-mono)] text-[11px] text-cyber-cyan bg-cyber-cyan/10 px-1.5 py-0.5 rounded">
            {item.match_score}/100
          </span>
        </div>
        {item.brand && <p className="text-[11px] text-cloudburst mb-2">{item.brand}</p>}
        <div className="flex flex-wrap gap-1">
          {(item.match_reasons || []).map((tag: string, i: number) => (
            <Badge key={i} variant={tag === "Best Match" ? "cyan" : "default"}>
              {tag}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );

  const renderSelect = (label: string, value: string, onChange: (v: string) => void, options: string[]) => (
    <div>
      <label className="block text-[11px] font-medium text-cloudburst mb-1.5 uppercase tracking-wider">{label}</label>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full bg-inkwell border border-starlight/10 rounded-[8px] px-3 py-2 text-porcelain text-sm focus:outline-none focus:border-cyber-cyan/50"
      >
        <option value="">Any</option>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );

  // ─── Insufficient wardrobe state ───────────────────────────────────
  if (!isLoadingWardrobe && wardrobeItems.length < 2) {
    return (
      <div className="min-h-screen bg-charcoal p-8 flex items-center justify-center">
        <Card variant="translucent" className="p-12 max-w-md text-center">
          <div className="text-5xl mb-4">👗</div>
          <h2 className="text-xl font-medium text-porcelain mb-3">Not Enough Wardrobe Items</h2>
          <p className="text-sm text-cloudburst mb-6">
            Add more clothing items to your wardrobe to get personalized outfit recommendations.
            You need at least 2 items to start.
          </p>
          <Button variant="filled" onClick={() => router.push("/upload")} className="bg-cyber-cyan text-inkwell font-medium">
            Upload Cloth
          </Button>
        </Card>
      </div>
    );
  }

  // ─── Main Render ───────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-charcoal p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-medium text-porcelain mb-1">Outfit AI</h1>
          <p className="text-sm text-cloudburst">Select an item and let our engine build the perfect outfit.</p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-[8px] bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* ─── Left Panel: Wardrobe Selector ─────────────────────── */}
          <div className="lg:col-span-4">
            <Card variant="translucent" className="p-5">
              <h2 className="text-sm font-medium text-porcelain mb-4 uppercase tracking-wider">Your Wardrobe</h2>
              
              {isLoadingWardrobe ? (
                <div className="flex items-center justify-center py-12">
                  <div className="w-6 h-6 border-2 border-cyber-cyan/30 border-t-cyber-cyan rounded-full animate-spin" />
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-2 max-h-[400px] overflow-y-auto pr-1 custom-scrollbar">
                  {wardrobeItems.map(item => renderItemCard(item, item.id === selectedItemId))}
                </div>
              )}

              {selectedItemId && (
                <p className="text-[11px] text-cyber-cyan mt-3 font-[family-name:var(--font-mono)]">
                  ✓ Item selected. Click again to deselect.
                </p>
              )}
            </Card>
          </div>

          {/* ─── Right Panel: Filters + Generate ───────────────────── */}
          <div className="lg:col-span-8 space-y-6">
            <Card variant="translucent" className="p-5">
              <h2 className="text-sm font-medium text-porcelain mb-4 uppercase tracking-wider">Preferences</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {renderSelect("Occasion", occasion, setOccasion, OCCASIONS)}
                {renderSelect("Weather / Season", weather, setWeather, WEATHER_OPTIONS)}
                {renderSelect("Gender Style", genderStyle, setGenderStyle, GENDER_OPTIONS)}
              </div>
              <div className="mt-5">
                <Button
                  variant="filled"
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="bg-cyber-cyan text-inkwell font-semibold w-full text-base py-3 hover:bg-cyber-cyan/90"
                >
                  {isGenerating ? (
                    <span className="flex items-center gap-2 justify-center">
                      <span className="w-2 h-2 rounded-full bg-inkwell animate-pulse" />
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
              <div className="space-y-6">
                {/* Outfit Score */}
                <Card variant="translucent" className="p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-sm font-medium text-porcelain uppercase tracking-wider">Outfit Score</h2>
                    <span className="font-[family-name:var(--font-mono)] text-2xl font-bold text-cyber-cyan">
                      {result.outfit_score}<span className="text-sm text-cloudburst">/100</span>
                    </span>
                  </div>
                  {/* Score Bar */}
                  <div className="w-full bg-inkwell rounded-full h-2 mb-4">
                    <div
                      className="bg-cyber-cyan h-2 rounded-full transition-all duration-700"
                      style={{ width: `${Math.min(result.outfit_score, 100)}%` }}
                    />
                  </div>
                  <p className="text-sm text-cloudburst italic">{result.explanation}</p>
                </Card>

                {/* Selected Item */}
                {result.selected_item && (
                  <div>
                    <h3 className="text-xs font-medium text-cloudburst mb-3 uppercase tracking-widest">Selected Item</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {renderRecommendedItem(result.selected_item)}
                    </div>
                  </div>
                )}

                {/* Best Bottom Matches */}
                {result.best_bottom_matches?.length > 0 && (
                  <div>
                    <h3 className="text-xs font-medium text-cloudburst mb-3 uppercase tracking-widest">Best Bottom Matches</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {result.best_bottom_matches.map((item: any) => renderRecommendedItem(item))}
                    </div>
                  </div>
                )}

                {/* Best Top Matches (if selected item is not a top) */}
                {result.best_top_matches?.length > 0 && (
                  <div>
                    <h3 className="text-xs font-medium text-cloudburst mb-3 uppercase tracking-widest">Best Top Matches</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {result.best_top_matches.map((item: any) => renderRecommendedItem(item))}
                    </div>
                  </div>
                )}

                {/* Best Footwear Matches */}
                {result.best_footwear_matches?.length > 0 && (
                  <div>
                    <h3 className="text-xs font-medium text-cloudburst mb-3 uppercase tracking-widest">Best Footwear</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {result.best_footwear_matches.map((item: any) => renderRecommendedItem(item))}
                    </div>
                  </div>
                )}

                {/* Accessories */}
                {result.accessories_suggestions?.length > 0 && (
                  <div>
                    <h3 className="text-xs font-medium text-cloudburst mb-3 uppercase tracking-widest">Accessories</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {result.accessories_suggestions.map((item: any) => renderRecommendedItem(item))}
                    </div>
                  </div>
                )}

                {/* Women-Specific Styling */}
                {(result.lipstick_suggestion || result.footwear_type_suggestion || result.accessory_suggestion) && (
                  <Card variant="translucent" className="p-5">
                    <h3 className="text-xs font-medium text-cyber-cyan mb-4 uppercase tracking-widest">✨ Styling Suggestions</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {result.lipstick_suggestion && (
                        <div>
                          <p className="text-[11px] text-cloudburst uppercase tracking-wider mb-2">Lipstick</p>
                          <div className="flex flex-wrap gap-1.5">
                            {result.lipstick_suggestion.map((l: string, i: number) => (
                              <Badge key={i} variant="cyan">{l}</Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      {result.footwear_type_suggestion && (
                        <div>
                          <p className="text-[11px] text-cloudburst uppercase tracking-wider mb-2">Footwear Style</p>
                          <div className="flex flex-wrap gap-1.5">
                            {result.footwear_type_suggestion.map((f: string, i: number) => (
                              <Badge key={i} variant="cyan">{f}</Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      {result.accessory_suggestion && (
                        <div>
                          <p className="text-[11px] text-cloudburst uppercase tracking-wider mb-2">Accessories</p>
                          <div className="flex flex-wrap gap-1.5">
                            {result.accessory_suggestion.map((a: string, i: number) => (
                              <Badge key={i} variant="cyan">{a}</Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </Card>
                )}

                {/* Avoid Combinations */}
                {result.avoid_combinations?.length > 0 && (
                  <Card variant="translucent" className="p-5 border-red-500/20">
                    <h3 className="text-xs font-medium text-red-400 mb-4 uppercase tracking-widest">⚠ Avoid These Combinations</h3>
                    <div className="space-y-3">
                      {result.avoid_combinations.map((avoid: any, i: number) => (
                        <div key={i} className="flex items-start gap-3 p-3 bg-red-500/5 rounded-[8px] border border-red-500/10">
                          <span className="text-red-400 text-lg mt-0.5">✕</span>
                          <div>
                            <p className="text-sm text-porcelain font-medium">
                              {avoid.item?.primary_color} {avoid.item?.type}
                            </p>
                            <p className="text-xs text-cloudburst mt-1">{avoid.reason}</p>
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
              <Card variant="translucent" className="p-8 text-center">
                <div className="text-4xl mb-3">📦</div>
                <h3 className="text-lg text-porcelain font-medium mb-2">Not Enough Items</h3>
                <p className="text-sm text-cloudburst mb-4">{result.explanation}</p>
                <Button variant="filled" onClick={() => router.push("/upload")} className="bg-cyber-cyan text-inkwell font-medium">
                  Upload Cloth
                </Button>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
