import Card from "../ui/Card";
import Badge from "../ui/Badge";
import Image from "next/image";
import Button from "../ui/Button";

interface WardrobeItem {
  id: string;
  category: string;
  primary_color?: string;
  front_image_url?: string;
}

interface OutfitRecommendationCardProps {
  outfit: {
    top?: WardrobeItem;
    bottom?: WardrobeItem;
    footwear?: WardrobeItem;
    accessory?: WardrobeItem;
  };
  score: number;
  reason: string;
  onSave?: () => void;
  onMarkWorn?: () => void;
}

export default function OutfitRecommendationCard({ outfit, score, reason, onSave, onMarkWorn }: OutfitRecommendationCardProps) {
  const items = [outfit.top, outfit.bottom, outfit.footwear, outfit.accessory].filter(Boolean) as WardrobeItem[];
  const isHighMatch = score >= 80;

  return (
    <Card variant="subtle" className="p-0 overflow-hidden border border-starlight/10 hover:border-cyber-cyan/30 transition-colors">
      <div className="p-5">
        <div className="flex justify-between items-start mb-4">
          <Badge variant={isHighMatch ? "success" : "orange"} className="bg-current/10 border border-current/20 px-2 py-0.5 rounded">
            {score}% Match
          </Badge>
          <div className="flex gap-2">
            {onSave && (
              <Button variant="ghost" size="sm" onClick={onSave} className="h-7 text-xs border border-starlight/10 hover:border-cyber-cyan/30">
                Save
              </Button>
            )}
            {onMarkWorn && (
              <Button variant="ghost-cyan" size="sm" onClick={onMarkWorn} className="h-7 text-xs border border-cyber-cyan/30 bg-cyber-cyan/5 hover:bg-cyber-cyan/10">
                Mark Worn
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
          {items.map((item, idx) => (
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
              <p className="text-xs font-medium text-porcelain truncate w-full">{item.category}</p>
              <p className="text-[10px] text-cloudburst truncate w-full">{item.primary_color}</p>
            </div>
          ))}
        </div>

        <div className="bg-inkwell/50 p-3 rounded-lg border-l-2 border-cyber-cyan">
          <p className="text-sm text-cloudburst leading-relaxed">
            <span className="text-porcelain font-medium mr-2">Why this works:</span>
            {reason}
          </p>
        </div>
      </div>
    </Card>
  );
}
