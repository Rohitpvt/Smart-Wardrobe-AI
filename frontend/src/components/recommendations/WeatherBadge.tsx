import { WeatherSnapshot } from "@/types/recommendations";
import { CloudRain, Sun, Cloud, Snowflake, Wind, Droplets } from "lucide-react";

export function WeatherBadge({ weather }: { weather: WeatherSnapshot | null }) {
  if (!weather || !weather.weather_used) return null;

  const getWeatherIcon = (condition: string) => {
    const c = condition.toLowerCase();
    if (c.includes("rain") || c.includes("drizzle")) return <CloudRain className="w-4 h-4" />;
    if (c.includes("snow") || c.includes("ice")) return <Snowflake className="w-4 h-4" />;
    if (c.includes("cloud") || c.includes("overcast")) return <Cloud className="w-4 h-4" />;
    if (c.includes("clear") || c.includes("sun")) return <Sun className="w-4 h-4 text-yellow-400" />;
    if (c.includes("wind")) return <Wind className="w-4 h-4" />;
    return <Sun className="w-4 h-4" />;
  };

  return (
    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-surface-2/80 backdrop-blur-md border border-white/10 rounded-xl text-xs font-medium text-slate-300 shadow-sm">
      <span className="text-brand-blue flex items-center gap-1.5">
        {getWeatherIcon(weather.condition || "")}
        {weather.temperature_celsius}°C
      </span>
      <span className="w-1 h-1 rounded-full bg-white/20" />
      <span className="capitalize">{weather.condition}</span>
      {weather.city && (
        <>
          <span className="w-1 h-1 rounded-full bg-white/20" />
          <span>{weather.city}</span>
        </>
      )}
    </div>
  );
}
