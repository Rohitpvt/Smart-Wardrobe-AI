import Card from "../ui/Card";
import Badge from "../ui/Badge";

interface WeatherCardProps {
  location?: string;
  temperature?: number;
  condition?: string;
  seasonHint?: string;
  advice?: string;
  isLoading?: boolean;
}

export default function WeatherCard({ 
  location = "Unknown", 
  temperature, 
  condition = "Unknown", 
  seasonHint,
  advice,
  isLoading 
}: WeatherCardProps) {
  
  if (isLoading) {
    return (
      <Card variant="translucent" className="p-6 h-48 animate-pulse flex flex-col justify-between border border-starlight/10">
        <div className="w-32 h-6 bg-starlight/10 rounded" />
        <div className="w-48 h-12 bg-starlight/10 rounded" />
        <div className="w-full h-4 bg-starlight/10 rounded" />
      </Card>
    );
  }

  // Very basic condition to emoji mapping
  const getIcon = (cond: string) => {
    const c = cond.toLowerCase();
    if (c.includes("rain") || c.includes("drizzle")) return "🌧️";
    if (c.includes("cloud") || c.includes("overcast")) return "☁️";
    if (c.includes("clear") || c.includes("sun")) return "☀️";
    if (c.includes("snow")) return "❄️";
    return "⛅";
  };

  return (
    <Card variant="translucent" className="p-6 relative overflow-hidden border border-starlight/10">
      <div className="absolute top-0 right-0 w-32 h-32 bg-glow-blue opacity-30 pointer-events-none rounded-full blur-2xl -mr-10 -mt-10" />
      
      <div className="flex justify-between items-start mb-6 relative z-10">
        <div>
          <h3 className="text-cloudburst text-sm uppercase tracking-widest mb-1">{location}</h3>
          <div className="flex items-center gap-3">
            <span className="text-4xl md:text-5xl font-medium text-porcelain font-[family-name:var(--font-mono)] tracking-tighter">
              {temperature !== undefined ? `${Math.round(temperature)}°` : "--°"}
            </span>
            <span className="text-4xl">{getIcon(condition)}</span>
          </div>
          <p className="text-porcelain capitalize mt-1">{condition}</p>
        </div>
        
        {seasonHint && (
          <Badge variant="cyan" className="bg-cyber-cyan/10 border border-cyber-cyan/20">
            {seasonHint} Season
          </Badge>
        )}
      </div>

      {advice && (
        <div className="pt-4 border-t border-starlight/10 relative z-10">
          <p className="text-sm text-cloudburst">
            <span className="text-cyber-cyan mr-2">AI Advice:</span>
            {advice}
          </p>
        </div>
      )}
    </Card>
  );
}
