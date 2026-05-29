"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";

const OCCASIONS = [
  "Casual", "Formal", "Party", "College", "Office",
  "Gym", "Wedding", "Ethnic Function", "Travel", "Daily Wear",
];

const POPULAR_LOCATIONS = [
  "Delhi", "Mumbai", "Bangalore", "Kolkata", "Chennai",
  "Hyderabad", "Pune", "Jaipur", "Lucknow", "Ahmedabad",
];

// Condition icons
const CONDITION_ICONS: Record<string, string> = {
  "Sunny": "☀️",
  "Cloudy": "☁️",
  "Partly Cloudy": "⛅",
  "Rainy": "🌧️",
  "Hazy": "🌫️",
  "Stormy": "⛈️",
  "Snowy": "❄️",
};

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

  const renderRecommendedItem = (item: any) => (
    <div key={item.id} className="bg-inkwell rounded-[12px] border border-starlight/10 overflow-hidden group hover:border-cyber-cyan/30 transition-all duration-200">
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
            <Badge key={i} variant={tag === "Best Match" ? "cyan" : tag === "Weather Safe" ? "cyan" : "default"}>
              {tag}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-charcoal p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-medium text-porcelain mb-1">Weather Style</h1>
          <p className="text-sm text-cloudburst">Get outfit suggestions based on today's weather conditions.</p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-[8px] bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Input Controls */}
        <Card variant="translucent" className="p-5 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
            {/* Location */}
            <div>
              <label className="block text-[11px] font-medium text-cloudburst mb-1.5 uppercase tracking-wider">Location</label>
              <div className="relative">
                <input
                  type="text"
                  value={location}
                  onChange={e => setLocation(e.target.value)}
                  placeholder="Enter city name..."
                  className="w-full bg-inkwell border border-starlight/10 rounded-[8px] px-3 py-2 text-porcelain text-sm focus:outline-none focus:border-cyber-cyan/50 placeholder:text-cloudburst/40"
                  list="location-suggestions"
                />
                <datalist id="location-suggestions">
                  {POPULAR_LOCATIONS.map(loc => (
                    <option key={loc} value={loc} />
                  ))}
                </datalist>
              </div>
            </div>

            {/* Occasion */}
            <div>
              <label className="block text-[11px] font-medium text-cloudburst mb-1.5 uppercase tracking-wider">Occasion</label>
              <select
                value={occasion}
                onChange={e => setOccasion(e.target.value)}
                className="w-full bg-inkwell border border-starlight/10 rounded-[8px] px-3 py-2 text-porcelain text-sm focus:outline-none focus:border-cyber-cyan/50"
              >
                <option value="">Any</option>
                {OCCASIONS.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>

            {/* Generate */}
            <div>
              <Button
                variant="filled"
                onClick={handleSuggest}
                disabled={isLoading}
                className="bg-cyber-cyan text-inkwell font-semibold w-full text-sm py-2.5 hover:bg-cyber-cyan/90"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2 justify-center">
                    <span className="w-2 h-2 rounded-full bg-inkwell animate-pulse" />
                    Analyzing Weather...
                  </span>
                ) : (
                  "☀️ Suggest Outfit for Today"
                )}
              </Button>
            </div>
          </div>
        </Card>

        {/* Weather Card */}
        {weatherData && (
          <Card variant="translucent" className="p-0 mb-6 overflow-hidden">
            <div className="p-5 bg-gradient-to-r from-inkwell to-carbon">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[11px] text-cloudburst uppercase tracking-widest mb-1">Current Weather</p>
                  <p className="text-lg text-porcelain font-medium">{weatherData.location}</p>
                </div>
                <div className="text-right">
                  <span className="text-4xl">{CONDITION_ICONS[weatherData.condition] || "🌤️"}</span>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-4 mt-5">
                <div className="text-center p-3 bg-charcoal/50 rounded-[8px]">
                  <p className="text-2xl font-bold text-porcelain">{weatherData.temperature}°</p>
                  <p className="text-[10px] text-cloudburst uppercase tracking-wider mt-1">Temperature</p>
                </div>
                <div className="text-center p-3 bg-charcoal/50 rounded-[8px]">
                  <p className="text-2xl font-bold text-porcelain">{weatherData.humidity}%</p>
                  <p className="text-[10px] text-cloudburst uppercase tracking-wider mt-1">Humidity</p>
                </div>
                <div className="text-center p-3 bg-charcoal/50 rounded-[8px]">
                  <p className="text-lg font-medium text-porcelain">{weatherData.condition}</p>
                  <p className="text-[10px] text-cloudburst uppercase tracking-wider mt-1">Condition</p>
                </div>
                <div className="text-center p-3 bg-charcoal/50 rounded-[8px]">
                  <Badge variant="cyan" className="text-[11px]">{weatherData.season_hint}</Badge>
                  <p className="text-[10px] text-cloudburst uppercase tracking-wider mt-2">Season</p>
                </div>
              </div>

              <div className="mt-4 p-3 bg-cyber-cyan/5 border border-cyber-cyan/15 rounded-[8px]">
                <p className="text-sm text-cyber-cyan italic">💡 {weatherData.clothing_advice}</p>
              </div>
            </div>
          </Card>
        )}

        {/* Outfit Results */}
        {outfitResult && !outfitResult.insufficient_wardrobe && (
          <div className="space-y-6">
            {/* Score */}
            <Card variant="translucent" className="p-5">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-medium text-porcelain uppercase tracking-wider">Outfit Score</h2>
                <span className="font-[family-name:var(--font-mono)] text-2xl font-bold text-cyber-cyan">
                  {outfitResult.outfit_score}<span className="text-sm text-cloudburst">/100</span>
                </span>
              </div>
              <div className="w-full bg-inkwell rounded-full h-2 mb-4">
                <div
                  className="bg-cyber-cyan h-2 rounded-full transition-all duration-700"
                  style={{ width: `${Math.min(outfitResult.outfit_score, 100)}%` }}
                />
              </div>
              <p className="text-sm text-cloudburst italic">{outfitResult.explanation}</p>
            </Card>

            {/* Selected Item */}
            {outfitResult.selected_item && (
              <div>
                <h3 className="text-xs font-medium text-cloudburst mb-3 uppercase tracking-widest">Recommended Starting Piece</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {renderRecommendedItem(outfitResult.selected_item)}
                </div>
              </div>
            )}

            {/* Bottom Matches */}
            {outfitResult.best_bottom_matches?.length > 0 && (
              <div>
                <h3 className="text-xs font-medium text-cloudburst mb-3 uppercase tracking-widest">Best Bottoms for Today</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {outfitResult.best_bottom_matches.map((item: any) => renderRecommendedItem(item))}
                </div>
              </div>
            )}

            {/* Top Matches */}
            {outfitResult.best_top_matches?.length > 0 && (
              <div>
                <h3 className="text-xs font-medium text-cloudburst mb-3 uppercase tracking-widest">Top Alternatives</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {outfitResult.best_top_matches.map((item: any) => renderRecommendedItem(item))}
                </div>
              </div>
            )}

            {/* Footwear */}
            {outfitResult.best_footwear_matches?.length > 0 && (
              <div>
                <h3 className="text-xs font-medium text-cloudburst mb-3 uppercase tracking-widest">Weather-Safe Footwear</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {outfitResult.best_footwear_matches.map((item: any) => renderRecommendedItem(item))}
                </div>
              </div>
            )}

            {/* Women Styling */}
            {(outfitResult.lipstick_suggestion || outfitResult.footwear_type_suggestion || outfitResult.accessory_suggestion) && (
              <Card variant="translucent" className="p-5">
                <h3 className="text-xs font-medium text-cyber-cyan mb-4 uppercase tracking-widest">✨ Styling Suggestions</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {outfitResult.lipstick_suggestion && (
                    <div>
                      <p className="text-[11px] text-cloudburst uppercase tracking-wider mb-2">Lipstick</p>
                      <div className="flex flex-wrap gap-1.5">
                        {outfitResult.lipstick_suggestion.map((l: string, i: number) => (
                          <Badge key={i} variant="cyan">{l}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {outfitResult.footwear_type_suggestion && (
                    <div>
                      <p className="text-[11px] text-cloudburst uppercase tracking-wider mb-2">Footwear Style</p>
                      <div className="flex flex-wrap gap-1.5">
                        {outfitResult.footwear_type_suggestion.map((f: string, i: number) => (
                          <Badge key={i} variant="cyan">{f}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {outfitResult.accessory_suggestion && (
                    <div>
                      <p className="text-[11px] text-cloudburst uppercase tracking-wider mb-2">Accessories</p>
                      <div className="flex flex-wrap gap-1.5">
                        {outfitResult.accessory_suggestion.map((a: string, i: number) => (
                          <Badge key={i} variant="cyan">{a}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            )}

            {/* Avoid */}
            {outfitResult.avoid_combinations?.length > 0 && (
              <Card variant="translucent" className="p-5 border-red-500/20">
                <h3 className="text-xs font-medium text-red-400 mb-4 uppercase tracking-widest">⚠ Avoid in This Weather</h3>
                <div className="space-y-3">
                  {outfitResult.avoid_combinations.map((avoid: any, i: number) => (
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

        {/* Insufficient wardrobe */}
        {outfitResult && outfitResult.insufficient_wardrobe && (
          <Card variant="translucent" className="p-8 text-center">
            <div className="text-4xl mb-3">📦</div>
            <h3 className="text-lg text-porcelain font-medium mb-2">Not Enough Items</h3>
            <p className="text-sm text-cloudburst mb-4">{outfitResult.explanation}</p>
            <Button variant="filled" onClick={() => router.push("/upload")} className="bg-cyber-cyan text-inkwell font-medium">
              Upload Cloth
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
}
