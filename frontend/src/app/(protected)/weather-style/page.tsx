"use client";

import { useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
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

      <div className="max-w-2xl mx-auto">
        <form onSubmit={fetchWeather} className="flex gap-2 mb-8">
          <div className="relative flex-1">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-cloudburst" />
            <Input 
              className="pl-10 h-12 text-lg" 
              placeholder="Enter city (e.g., London, New York)" 
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>
          <Button type="submit" size="lg" isLoading={loading}>
            <Search className="h-5 w-5 mr-2" /> Check
          </Button>
        </form>

        {weather && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <Card className="border-cyber-cyan/30 overflow-hidden relative">
              <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                <CloudSun className="w-48 h-48" />
              </div>
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-cyber-cyan" /> {weather.location}
                  {weather.provider === "mock" && (
                    <span className="ml-2 text-xs bg-white/10 px-2 py-1 rounded-full text-cloudburst border border-white/10">Mock Mode</span>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-end gap-4 mb-8">
                  <h1 className="text-7xl font-bold tracking-tighter text-porcelain">{weather.temperature}&deg;</h1>
                  <p className="text-2xl text-cloudburst capitalize pb-2">{weather.condition}</p>
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="bg-white/5 backdrop-blur-sm p-4 rounded-xl border border-white/10 hover:bg-white/10 transition-colors">
                    <Thermometer className="h-5 w-5 text-cyber-cyan mb-2" />
                    <p className="text-sm text-cloudburst">Season Hint</p>
                    <p className="font-medium text-porcelain capitalize">{weather.season_hint}</p>
                  </div>
                  <div className="bg-white/5 backdrop-blur-sm p-4 rounded-xl border border-white/10 hover:bg-white/10 transition-colors">
                    <Droplets className="h-5 w-5 text-cyber-cyan mb-2" />
                    <p className="text-sm text-cloudburst">Humidity</p>
                    <p className="font-medium text-porcelain">{weather.humidity}%</p>
                  </div>
                  <div className="bg-white/5 backdrop-blur-sm p-4 rounded-xl border border-white/10 hover:bg-white/10 transition-colors">
                    <Wind className="h-5 w-5 text-cyber-cyan mb-2" />
                    <p className="text-sm text-cloudburst">Wind Speed</p>
                    <p className="font-medium text-porcelain">{weather.wind_speed} m/s</p>
                  </div>
                  <div className="bg-white/5 backdrop-blur-sm p-4 rounded-xl border border-white/10 hover:bg-white/10 transition-colors">
                    <CloudSun className="h-5 w-5 text-cyber-cyan mb-2" />
                    <p className="text-sm text-cloudburst">Key</p>
                    <p className="font-medium text-porcelain capitalize">{weather.weather_key}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-cyber-cyan/5 border-cyber-cyan/20">
              <CardContent className="p-6">
                <div className="flex gap-4">
                  <div className="p-3 bg-cyber-cyan/20 rounded-full h-fit text-cyber-cyan">
                    <Sparkles className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-porcelain mb-2">Styling Advice</h3>
                    <p className="text-cloudburst leading-relaxed">{weather.clothing_advice}</p>
                    
                    <Link href={`/outfits/recommendations?location=${encodeURIComponent(weather.location)}`}>
                      <Button className="mt-4" variant="outline">
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
