"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import PageHeader from "@/components/ui/PageHeader";
import WeatherCard from "@/components/weather/WeatherCard";
import OutfitRecommendationCard from "@/components/outfits/OutfitRecommendationCard";
import EmptyState from "@/components/ui/EmptyState";
import Image from "next/image";

const OCCASIONS = [
  "Casual", "Formal", "Party", "College", "Office",
  "Gym", "Wedding", "Ethnic Function", "Travel", "Daily Wear",
];

const POPULAR_LOCATIONS = [
  "Delhi", "Mumbai", "Bangalore", "Kolkata", "Chennai",
  "Hyderabad", "Pune", "Jaipur", "Lucknow", "Ahmedabad",
];

interface WeatherData {
  location: string;
  temperature: number;
  condition: string;
  humidity: number;
  season_hint: string;
  weather_key: string;
  clothing_advice: string;
  provider: string;
}

export default function WeatherStylePage() {
  const router = useRouter();

  // Inputs
  const [location, setLocation] = useState("");
  const [occasion, setOccasion] = useState("");

  // State
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [outfitResult, setOutfitResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSuggest = async () => {
    try {
      setIsLoading(true);
      setError("");
      setWeatherData(null);
      setOutfitResult(null);

      // 1. Fetch weather
      const weather = await api.weather.current(location || undefined);
      setWeatherData(weather);

      // 2. Fetch weather-aware outfit
      const outfit = await api.weather.outfit({
        location: location || undefined,
        occasion: occasion || undefined,
      });
      setOutfitResult(outfit);
    } catch (err: any) {
      setError(err.message || "Failed to fetch weather suggestion.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8">
      <PageHeader 
        title="Weather Style" 
        description="Get outfit suggestions tailored to today's climate."
        badge={{ text: "AI + Live Data", variant: "cyan" }}
      />

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Inputs & Weather */}
        <div className="lg:col-span-5 space-y-6">
          {/* Input Controls */}
          <Card variant="translucent" className="p-6">
            <h2 className="text-sm font-medium text-porcelain mb-4 uppercase tracking-wider flex items-center gap-2">
              <span className="text-cyber-cyan text-sm">📍</span> Location
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-[11px] font-medium text-cloudburst mb-1.5 uppercase tracking-wider">City</label>
                <div className="relative">
                  <input
                    type="text"
                    value={location}
                    onChange={e => setLocation(e.target.value)}
                    placeholder="Enter city name..."
                    className="w-full bg-inkwell border border-starlight/10 rounded-xl px-4 py-3 text-porcelain text-sm focus:outline-none focus:border-cyber-cyan/50 focus:ring-1 focus:ring-cyber-cyan/50 placeholder:text-cloudburst/40 transition-colors"
                    list="location-suggestions"
                  />
                  <datalist id="location-suggestions">
                    {POPULAR_LOCATIONS.map(loc => (
                      <option key={loc} value={loc} />
                    ))}
                  </datalist>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-cloudburst mb-1.5 uppercase tracking-wider">Occasion</label>
                <select
                  value={occasion}
                  onChange={e => setOccasion(e.target.value)}
                  className="w-full bg-inkwell border border-starlight/10 rounded-xl px-4 py-3 text-porcelain text-sm focus:outline-none focus:border-cyber-cyan/50 focus:ring-1 focus:ring-cyber-cyan/50 transition-colors"
                >
                  <option value="">Any</option>
                  {OCCASIONS.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>

              <div className="pt-2">
                <Button
                  variant="filled"
                  size="lg"
                  onClick={handleSuggest}
                  disabled={isLoading}
                  className="w-full bg-cyber-cyan text-carbon hover:bg-white"
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2 justify-center">
                      <span className="w-4 h-4 border-2 border-carbon border-t-transparent rounded-full animate-spin" />
                      Analyzing...
                    </span>
                  ) : (
                    "☀️ Generate Outfit"
                  )}
                </Button>
              </div>
            </div>
          </Card>

          {/* Weather Card Display */}
          {(weatherData || isLoading) && (
            <div className="animate-fade-in-up">
              <WeatherCard 
                isLoading={isLoading && !weatherData}
                location={weatherData?.location}
                temperature={weatherData?.temperature}
                condition={weatherData?.condition}
                seasonHint={weatherData?.season_hint}
                advice={weatherData?.clothing_advice}
              />
            </div>
          )}
        </div>

        {/* Right Column: Outfit Results */}
        <div className="lg:col-span-7">
          {outfitResult && !outfitResult.insufficient_wardrobe && (
            <div className="space-y-6 animate-fade-in-up">
              
              <h3 className="text-lg font-medium text-porcelain mb-2">Recommended Outfit</h3>
              
              <OutfitRecommendationCard 
                score={outfitResult.outfit_score}
                reason={outfitResult.explanation}
                outfit={{
                  top: outfitResult.selected_item?.type?.toLowerCase().includes('shirt') || outfitResult.selected_item?.type?.toLowerCase().includes('top') ? outfitResult.selected_item : outfitResult.best_top_matches?.[0] || outfitResult.selected_item,
                  bottom: outfitResult.selected_item?.type?.toLowerCase().includes('pant') || outfitResult.selected_item?.type?.toLowerCase().includes('jeans') ? outfitResult.selected_item : outfitResult.best_bottom_matches?.[0],
                  footwear: outfitResult.best_footwear_matches?.[0],
                  accessory: outfitResult.accessories_suggestions?.[0]
                }}
                onSave={() => alert("Outfit saving to be implemented")}
                onMarkWorn={() => alert("Mark as worn to be implemented")}
              />

              {/* Alternatives */}
              {((outfitResult.best_top_matches?.length > 1) || (outfitResult.best_bottom_matches?.length > 1)) && (
                <Card variant="translucent" className="p-6">
                  <h3 className="text-sm font-medium text-porcelain mb-4">Alternatives</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {[...(outfitResult.best_top_matches || []), ...(outfitResult.best_bottom_matches || [])].slice(1, 5).map((item: any, idx: number) => (
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
                        <p className="text-[10px] font-medium text-porcelain truncate w-full">{item.type}</p>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {/* Avoid */}
              {outfitResult.avoid_combinations?.length > 0 && (
                <Card variant="translucent" className="p-6 border border-red-500/20 bg-red-500/5">
                  <h3 className="text-xs font-medium text-red-400 mb-4 uppercase tracking-widest flex items-center gap-2">
                    <span className="text-sm">⚠</span> Avoid in This Weather
                  </h3>
                  <div className="grid grid-cols-1 gap-3">
                    {outfitResult.avoid_combinations.map((avoid: any, i: number) => (
                      <div key={i} className="flex items-start gap-3 p-3 bg-carbon rounded-xl border border-red-500/10 shadow-sm">
                        <span className="text-red-400 text-lg mt-0.5">✕</span>
                        <div>
                          <p className="text-sm text-porcelain font-medium">
                            {avoid.item?.primary_color} {avoid.item?.type}
                          </p>
                          <p className="text-xs text-cloudburst mt-1 leading-relaxed">{avoid.reason}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              )}
            </div>
          )}

          {/* Insufficient wardrobe */}
          {outfitResult && outfitResult.insufficient_wardrobe && (
            <div className="mt-8">
              <EmptyState 
                title="Not Enough Weather-Appropriate Items"
                description={outfitResult.explanation}
                actionLabel="Upload Cloth"
                onAction={() => router.push("/upload")}
                icon="📦"
              />
            </div>
          )}
          
          {/* Initial state placeholder */}
          {!outfitResult && !isLoading && (
            <Card variant="basic" className="h-full min-h-[400px] flex flex-col items-center justify-center border-dashed border-starlight/20 bg-transparent">
              <div className="text-4xl mb-4 opacity-50">🌤️</div>
              <p className="text-cloudburst text-sm">Enter a location to get weather-based outfit suggestions.</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
