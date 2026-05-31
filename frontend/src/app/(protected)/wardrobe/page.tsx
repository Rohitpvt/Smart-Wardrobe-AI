"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Spinner } from "@/components/ui/Spinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { ClothingItem } from "@/lib/types";
import api from "@/lib/api";
import { Shirt, Search, Plus, Filter } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useToast } from "@/hooks/useToast";

export default function WardrobePage() {
  const [items, setItems] = useState<ClothingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const { showToast } = useToast();

  const fetchWardrobe = async () => {
    try {
      setLoading(true);
      const res = await api.get("/clothing/");
      setItems(res.data);
    } catch (error) {
      console.error("Failed to fetch wardrobe", error);
      showToast("Failed to load wardrobe items", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line
    fetchWardrobe();
  }, []);

  const filteredItems = items.filter(item => 
    item.type.toLowerCase().includes(search.toLowerCase()) || 
    item.category.toLowerCase().includes(search.toLowerCase()) ||
    item.primary_color.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <PageHeader 
        title="My Wardrobe" 
        description="View and manage all your digitized clothing items."
        action={
          <Link href="/upload">
            <Button><Plus className="mr-2 h-4 w-4" /> Add Item</Button>
          </Link>
        }
      />

      <div className="flex gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-cloudburst" />
          <Input 
            className="pl-10" 
            placeholder="Search by type, color, or category..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button variant="outline" className="hidden sm:flex">
          <Filter className="mr-2 h-4 w-4" /> Filter
        </Button>
      </div>

      {loading ? (
        <div className="py-20 flex justify-center"><Spinner size="lg" /></div>
      ) : filteredItems.length === 0 ? (
        <EmptyState 
          icon={<Shirt className="h-10 w-10" />}
          title={items.length === 0 ? "Your wardrobe is empty" : "No items found"}
          description={items.length === 0 ? "Start digitizing your closet by uploading your first item." : "Try adjusting your search terms."}
          action={items.length === 0 ? (
            <Link href="/upload"><Button>Upload Clothing</Button></Link>
          ) : undefined}
        />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filteredItems.map(item => (
            <ClothingCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}

function ClothingCard({ item }: { item: ClothingItem }) {
  return (
    <Card className="group cursor-pointer hover:border-cyber-cyan/50 transition-colors">
      <div className="aspect-[3/4] relative bg-charcoal/80 overflow-hidden border-b border-white/5">
        {item.front_image_url ? (
          <Image 
            src={item.front_image_url} 
            alt={item.type} 
            fill
            unoptimized
            sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
            className="object-cover group-hover:scale-105 transition-transform duration-500" 
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Shirt className="h-12 w-12 text-white/10" />
          </div>
        )}
        <div className="absolute top-2 right-2 flex gap-1">
          {item.ai_detected && (
            <span className="bg-cyber-cyan text-inkwell text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">
              AI Tagged
            </span>
          )}
        </div>
      </div>
      <CardContent className="p-4">
        <h3 className="font-semibold text-porcelain truncate">{item.type}</h3>
        <p className="text-xs text-cloudburst mt-1 capitalize">{item.primary_color} • {item.category}</p>
      </CardContent>
    </Card>
  );
}
