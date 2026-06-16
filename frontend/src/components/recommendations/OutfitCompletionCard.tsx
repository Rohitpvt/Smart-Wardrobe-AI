import { ClothingItemMinimal } from "@/types/recommendations";
import { getImageUrl } from "@/lib/image-url";
import { Sparkles, Anchor, CheckCircle2 } from "lucide-react";
import { m } from "framer-motion";
import Image from "next/image";

interface OutfitCompletionData {
  anchor_item: ClothingItemMinimal;
  top_item: ClothingItemMinimal;
  bottom_item: ClothingItemMinimal;
  footwear_item: ClothingItemMinimal;
  outerwear_item?: ClothingItemMinimal;
  accessories: Record<string, string>;
  reasoning: string;
  confidence_score: number;
}

interface OutfitCompletionCardProps {
  data: OutfitCompletionData;
}

export function OutfitCompletionCard({ data }: OutfitCompletionCardProps) {
  const renderItem = (item: ClothingItemMinimal, label: string, isAnchor: boolean = false) => (
    <div className="flex flex-col group relative">
      {isAnchor && (
        <div className="absolute -top-3 -right-3 z-20 bg-brand-blue text-white w-8 h-8 rounded-full flex items-center justify-center shadow-lg border-2 border-surface-1">
          <Anchor className="w-4 h-4" />
        </div>
      )}
      <span className="text-[10px] font-label-sm text-slate-500 uppercase tracking-widest mb-3 pl-1 flex items-center gap-2">
        {label}
        {isAnchor && <span className="text-brand-blue font-bold">(Anchor)</span>}
      </span>
      <div className={`bg-surface-2 rounded-2xl border ${isAnchor ? 'border-brand-blue/50' : 'border-white/5'} overflow-hidden group-hover:border-brand-blue/30 transition-all shadow-[0_0_20px_rgba(0,0,0,0.2)]`}>
        <div className="aspect-[3/4] relative bg-[#060816] overflow-hidden">
          {item.image_url ? (
            <Image 
              src={getImageUrl(item.image_url) || ""} 
              alt={item.name}
              fill
              sizes="(max-width: 768px) 100vw, 33vw"
              unoptimized={true}
              className="object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700 ease-out"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-surface-3">
              <span className="text-4xl opacity-50">👕</span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent opacity-80 group-hover:opacity-100 transition-opacity duration-300" />
          
          <div className="absolute bottom-0 left-0 right-0 p-4 z-10">
            <h4 className="text-sm font-semibold text-white truncate drop-shadow-md">{item.name}</h4>
            <div className="flex items-center gap-2 mt-1">
              <span className="w-2.5 h-2.5 rounded-full border border-white/20" style={{ backgroundColor: item.color.toLowerCase() }} />
              <p className="text-xs text-slate-300 capitalize truncate">{item.color}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <m.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-surface-1/70 border border-white/10 rounded-3xl overflow-hidden shadow-[0_0_40px_rgba(59,130,246,0.03)] hover:border-brand-purple/30 transition-all duration-500 relative group/card backdrop-blur-xl max-w-4xl w-full"
    >
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-brand-purple/10 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none opacity-50 group-hover/card:opacity-100 transition-opacity duration-700" />
      
      <div className="p-6 md:p-8 border-b border-white/5 flex flex-col sm:flex-row sm:items-start justify-between gap-6 relative z-10">
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 bg-brand-purple/10 text-brand-purple px-3 py-1.5 rounded-lg border border-brand-purple/20">
              <Sparkles className="w-4 h-4" />
              <span className="text-xs font-label-md uppercase tracking-wider font-semibold">Outfit Builder Completion</span>
            </div>
            <div className="flex items-center gap-1.5 bg-emerald-500/10 text-emerald-400 px-2 py-1 rounded border border-emerald-500/20 text-xs font-medium tracking-wider">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Score: {data.confidence_score}%
            </div>
          </div>
          
          <div>
            <h3 className="text-2xl md:text-3xl font-bold text-white tracking-tight capitalize mb-1">
              Built around {data.anchor_item.name}
            </h3>
          </div>
        </div>
      </div>

      <div className="p-6 md:p-8 relative z-10 bg-gradient-to-b from-transparent to-surface-1/40">
        <div className={`grid grid-cols-1 md:grid-cols-3 lg:grid-cols-${data.outerwear_item ? '4' : '3'} gap-6 lg:gap-8`}>
          {renderItem(data.top_item, "Topwear", data.top_item.id === data.anchor_item.id)}
          {renderItem(data.bottom_item, "Bottomwear", data.bottom_item.id === data.anchor_item.id)}
          {renderItem(data.footwear_item, "Footwear", data.footwear_item.id === data.anchor_item.id)}
          {data.outerwear_item && renderItem(data.outerwear_item, "Outerwear", data.outerwear_item.id === data.anchor_item.id)}
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Reasoning */}
          <div className="bg-surface-2/80 backdrop-blur-md border border-brand-purple/20 rounded-2xl p-6 relative overflow-hidden group/notes h-full">
            <div className="absolute inset-0 bg-gradient-to-r from-brand-purple/5 to-transparent opacity-0 group-hover/notes:opacity-100 transition-opacity duration-500 pointer-events-none" />
            <div className="flex items-start gap-4 relative z-10">
              <div className="w-10 h-10 shrink-0 rounded-xl bg-gradient-to-br from-brand-purple to-brand-blue p-px shadow-[0_0_20px_rgba(139,92,246,0.3)]">
                 <div className="w-full h-full bg-surface-1 rounded-[11px] flex items-center justify-center">
                   <Sparkles className="w-5 h-5 text-brand-purple" />
                 </div>
              </div>
              <div>
                <h4 className="text-base font-semibold text-white tracking-tight mb-2">Stylist Reasoning</h4>
                <p className="text-sm text-slate-300 leading-relaxed">
                  {data.reasoning}
                </p>
              </div>
            </div>
          </div>

          {/* Accessories */}
          <div className="bg-surface-2/80 backdrop-blur-md border border-white/10 rounded-2xl p-6 relative overflow-hidden">
            <h4 className="text-base font-semibold text-white tracking-tight mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-brand-blue" />
              Recommended Accessories
            </h4>
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(data.accessories).map(([key, value]) => (
                <div key={key} className="bg-white/5 border border-white/5 rounded-lg p-3">
                  <span className="block text-[10px] text-slate-500 uppercase tracking-wider mb-1">{key}</span>
                  <span className="text-sm font-medium text-slate-200">{value as string}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </m.div>
  );
}
