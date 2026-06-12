"use client";

import { ClothingItem } from "@/types/wardrobe";
import Link from "next/link";

interface ClothingCardProps {
  item: ClothingItem;
}

export function ClothingCard({ item }: ClothingCardProps) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";

  return (
    <Link href={`/wardrobe/${item.id}`}>
      <div className="group relative rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer">
        {/* Image */}
        <div className="aspect-square overflow-hidden bg-zinc-100 dark:bg-zinc-800">
          <img
            src={`${apiUrl}/${item.image_url}`}
            alt={item.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>

        {/* Info */}
        <div className="p-3 space-y-1.5">
          <h3 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100 truncate">
            {item.name}
          </h3>
          <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
            <span className="px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 font-medium">
              {item.category}
            </span>
            <span className="flex items-center gap-1">
              <span
                className="w-3 h-3 rounded-full border border-zinc-300 dark:border-zinc-600"
                style={{ backgroundColor: item.color.toLowerCase() }}
              />
              {item.color}
            </span>
          </div>
          {item.brand && (
            <p className="text-xs text-zinc-400 dark:text-zinc-500 truncate">{item.brand}</p>
          )}
        </div>
      </div>
    </Link>
  );
}
