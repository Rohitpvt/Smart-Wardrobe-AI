import { ReactNode } from "react";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Image from "next/image";
import Button from "@/components/ui/Button";
import Link from "next/link";

interface WardrobeItem {
  id: string;
  category: string;
  sub_category?: string;
  primary_color?: string;
  front_image_url?: string;
  is_clean: boolean;
  needs_repair: boolean;
  wear_count: number;
}

interface WardrobeCardProps {
  item: WardrobeItem;
}

export default function WardrobeCard({ item }: WardrobeCardProps) {
  const hasIssues = !item.is_clean || item.needs_repair;

  return (
    <Card variant="translucent" className="relative group overflow-hidden flex flex-col h-full border border-starlight/10 hover:border-cyber-cyan/30 transition-all p-4">
      {/* Action Overlay */}
      <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
        <Link href={`/wardrobe/${item.id}`}>
          <Button variant="filled" size="sm" className="shadow-lg">View</Button>
        </Link>
      </div>

      {/* Image Area */}
      <div className="relative w-full aspect-[4/5] mb-3 rounded-lg overflow-hidden bg-inkwell border border-starlight/5 flex items-center justify-center">
        {item.front_image_url ? (
          <Image 
            src={item.front_image_url} 
            alt={item.category}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="text-4xl">👕</div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="text-porcelain font-medium truncate pr-2 leading-tight">
              {item.sub_category || item.category}
            </h3>
            <p className="text-cloudburst text-xs mt-0.5 capitalize">
              {item.primary_color || "Unknown color"}
            </p>
          </div>
          <Badge variant="default" className="text-[10px] shrink-0 border border-starlight/10 bg-carbon px-1">
            {item.wear_count} wears
          </Badge>
        </div>

        {/* Status Badges */}
        <div className="mt-auto flex flex-wrap gap-1 pt-2">
          {hasIssues && (
            <>
              {!item.is_clean && <Badge variant="warning" dot className="text-[10px]">Dirty</Badge>}
              {item.needs_repair && <Badge variant="orange" dot className="text-[10px]">Needs Repair</Badge>}
            </>
          )}
          {!hasIssues && (
            <Badge variant="cyan" dot className="text-[10px] opacity-0 group-hover:opacity-100 transition-opacity">Ready</Badge>
          )}
        </div>
      </div>
    </Card>
  );
}
