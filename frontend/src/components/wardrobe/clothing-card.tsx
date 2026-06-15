"use client";

import { ClothingItem } from "@/types/wardrobe";
import Link from "next/link";
import { getImageUrl } from "@/lib/image-url";
import { m } from "framer-motion";
import Image from "next/image";

interface ClothingCardProps {
  item: ClothingItem;
  index: number;
  onLogWear?: (id: string) => void;
}

export function ClothingCard({ item, index, onLogWear }: ClothingCardProps) {
  const isDark = item.color.toLowerCase() === "black" || item.color.toLowerCase() === "navy";

  return (
    <m.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.05, ease: "easeOut" }}
      className="group rounded-2xl overflow-hidden bg-surface-1/70 backdrop-blur-xl border border-white/10 hover:border-white/15 hover:-translate-y-[2px] hover:shadow-[0_0_40px_rgba(59,130,246,0.1)] transition-all duration-300 break-inside-avoid relative"
    >
      <Link href={`/wardrobe/${item.id}`} className="block relative aspect-[3/4] bg-surface-2 overflow-hidden">
        {item.image_url && (
          <Image
            src={getImageUrl(item.image_url) || ""}
            alt={item.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
            unoptimized={true}
            className="object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
          />
        )}
        
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#060816]/90 via-[#060816]/30 to-transparent z-10 opacity-80 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Badges */}
        <div className="absolute top-3 left-3 right-3 flex justify-between z-20">
          <span className="px-2.5 py-1 rounded-lg bg-surface-1/80 backdrop-blur-md border border-white/10 text-[10px] font-label-sm text-text-primary uppercase tracking-wider">
            {item.category}
          </span>
          {item.season && (
            <span className="px-2.5 py-1 rounded-lg bg-surface-1/80 backdrop-blur-md border border-white/10 text-[10px] font-label-sm text-brand-blue uppercase tracking-wider">
              {item.season.replace("_", " ")}
            </span>
          )}
        </div>

        {/* Quick View Affordance */}
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
           <button className="px-6 py-2 rounded-full border border-brand-blue text-brand-blue font-label-md text-sm hover:bg-brand-blue hover:text-white transition-colors shadow-[0_0_20px_rgba(59,130,246,0.2)] bg-[#060816]/50 backdrop-blur-sm">
             Quick View
           </button>
           {onLogWear && (
             <button
               onClick={(e) => {
                 e.preventDefault();
                 onLogWear(item.id);
               }}
               className="px-6 py-2 rounded-full border border-emerald-500 text-emerald-400 font-label-md text-sm hover:bg-emerald-500 hover:text-white transition-colors shadow-[0_0_20px_rgba(16,185,129,0.2)] bg-[#060816]/50 backdrop-blur-sm"
             >
               Log Wear
             </button>
           )}
        </div>

        {/* Content Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 z-20">
          <h3 className="font-semibold text-sm text-white truncate mb-1">
            {item.name}
          </h3>
          <div className="flex items-center gap-2 text-xs text-text-secondary">
             <span className="flex items-center gap-1.5">
               <span
                 className="w-2.5 h-2.5 rounded-full border border-white/20"
                 style={{ backgroundColor: item.color.toLowerCase() }}
               />
               {item.color}
             </span>
             {item.brand && (
               <>
                 <span className="text-white/30">•</span>
                 <span className="truncate">{item.brand}</span>
               </>
             )}
          </div>
        </div>
      </Link>
    </m.div>
  );
}
