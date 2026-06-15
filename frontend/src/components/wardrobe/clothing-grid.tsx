"use client";

import { ClothingItem } from "@/types/wardrobe";
import { ClothingCard } from "./clothing-card";
import Link from "next/link";
import { UploadCloud, LayoutGrid } from "lucide-react";
import { m } from "framer-motion";

interface ClothingGridProps {
  items: ClothingItem[];
  onLogWear?: (id: string) => void;
}

export function ClothingGrid({ items, onLogWear }: ClothingGridProps) {
  if (items.length === 0) {
    return (
      <m.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center py-24 px-6 text-center rounded-2xl bg-surface-1/70 border border-white/10 backdrop-blur-xl relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-brand-purple/15 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none" />
        
        <div className="w-20 h-20 mb-6 rounded-2xl bg-brand-blue/10 flex items-center justify-center border border-white/5">
          <LayoutGrid className="w-10 h-10 text-brand-blue/60" />
        </div>
        
        <h3 className="text-2xl font-bold text-text-primary mb-3">No clothing items found</h3>
        <p className="text-text-secondary max-w-md mb-8 leading-relaxed">
          Your search or filter criteria didn&apos;t match any items in your digital wardrobe. Try adjusting your filters, or add new pieces to expand your collection.
        </p>
        
        <Link href="/wardrobe/upload" className="ds-btn-primary px-8 py-3.5 shadow-[0_0_30px_-5px_rgba(59,130,246,0.4)]">
          <UploadCloud className="w-5 h-5 mr-2" />
          Add New Clothing
        </Link>
      </m.div>
    );
  }

  return (
    <div className="columns-2 md:columns-3 lg:columns-4 xl:columns-5 gap-6 space-y-6">
      {items.map((item, index) => (
        <ClothingCard key={item.id} item={item} index={index} onLogWear={onLogWear} />
      ))}
    </div>
  );
}
