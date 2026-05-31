"use client";

import { useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/hooks/useToast";
import api from "@/lib/api";
import { WeatherData } from "@/lib/types";
import { CloudSun, Search, Thermometer, Wind, Droplets, MapPin, Sparkles } from "lucide-react";
import Link from "next/link";

export default function WeatherStylePage() {
  const [location, setLocation] = useState("");
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const fetchWeather = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!location) return;

    setLoading(true);
    try {
      const res = await api.get(`/weather/current?location=${encodeURIComponent(location)}`);
      setWeather(res.data);
    } catch (error: any) {
      showToast(error.response?.data?.detail || "Could not fetch weather data.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <PageHeader 
        title="Weather Style" 
        description="Check live local conditions and get immediate styling advice."
      />

      <div className="max-w-3xl mx-auto">
        <form onSubmit={fetchWeather} className="flex gap-3 mb-8">
          <div className="relative flex-1">
            <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-cloudburst" />
            <Input 
              className="pl-10 h-12" 
              placeholder="Enter city (e.g., London, New York)" 
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>
          <Button type="submit" size="lg" isLoading={loading}>
            <Search className="h-4 w-4 mr-2" /> Check
          </Button>
        </form>

        {weather && (
          <div className="space-y-5">
            {/* Main Weather Card */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2 text-cloudburst">
                    <MapPin className="h-4 w-4 text-cyber-cyan" />
                    <span className="text-sm font-medium text-porcelain">{weather.location}</span>
                    {weather.provider === "mock" && (
                      <span className="text-[10px] bg-surface-raised px-2 py-0.5 rounded-md text-cloudburst border border-border-subtle">Mock</span>
                    )}
                  </div>
                  <CloudSun className="h-8 w-8 text-white/10" />
                </div>
                
                <div className="flex items-end gap-3 mb-8">
                  <h1 className="text-6xl font-bold tracking-tighter text-porcelain leading-none">{weather.temperature}&deg;</h1>
                  <p className="text-lg text-cloudburst capitalize pb-1">{weather.condition}</p>
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <WeatherStat icon={<Thermometer className="h-4 w-4" />} label="Season" value={weather.season_hint} />
                  <WeatherStat icon={<Droplets className="h-4 w-4" />} label="Humidity" value={`${weather.humidity}%`} />
                  <WeatherStat icon={<Wind className="h-4 w-4" />} label="Wind" value={`${weather.wind_speed} m/s`} />
                  <WeatherStat icon={<CloudSun className="h-4 w-4" />} label="Key" value={weather.weather_key} />
                </div>
              </CardContent>
            </Card>

            {/* Styling Advice */}
            <Card>
              <CardContent className="p-6">
                <div className="flex gap-4">
                  <div className="p-3 bg-cyber-cyan/8 rounded-xl h-fit text-cyber-cyan shrink-0 border border-cyber-cyan/10">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-porcelain mb-2">Styling Advice</h3>
                    <p className="text-sm text-cloudburst leading-relaxed">{weather.clothing_advice}</p>
                    
                    <Link href={`/outfits/recommendations?location=${encodeURIComponent(weather.location)}`}>
                      <Button className="mt-4" variant="outline" size="sm">
                        Generate Outfit for this Weather
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

function WeatherStat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="p-3.5 rounded-xl bg-surface-raised border border-border-subtle">
      <div className="text-cyber-cyan mb-2">{icon}</div>
      <p className="text-[11px] text-cloudburst">{label}</p>
      <p className="text-sm font-medium text-porcelain capitalize mt-0.5">{value}</p>
    </div>
  );
}
