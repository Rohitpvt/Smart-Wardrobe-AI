"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import Link from "next/link";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import * as Constants from "@/lib/constants";

export default function WardrobePage() {
  const router = useRouter();
  const [items, setItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Filters
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [type, setType] = useState("");
  const [season, setSeason] = useState("");

  const fetchItems = async () => {
    try {
      setIsLoading(true);
      const data = await api.clothing.list({
        search, category, type, season
      });
      setItems(data as any[]);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchItems();
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [search, category, type, season]);

  return (
    <div className="min-h-screen bg-charcoal p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h1 className="text-3xl font-medium text-porcelain">My Wardrobe</h1>
          <Button variant="filled" onClick={() => router.push("/upload")} className="bg-cyber-cyan text-inkwell">
            + Upload Cloth
          </Button>
        </div>

        {/* Filters Toolbar */}
        <Card variant="translucent" className="p-4 flex flex-wrap gap-4 items-center">
          <div className="flex-1 min-w-[200px]">
            <input 
              type="text" 
              placeholder="Search brand, color, notes..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-inkwell border border-starlight/10 rounded-[8px] px-4 py-2 text-porcelain text-sm focus:outline-none focus:border-cyber-cyan/50"
            />
          </div>
          <select value={category} onChange={e => setCategory(e.target.value)} className="bg-inkwell border border-starlight/10 rounded-[8px] px-4 py-2 text-porcelain text-sm focus:outline-none focus:border-cyber-cyan/50">
            <option value="">All Categories</option>
            {Constants.CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select value={type} onChange={e => setType(e.target.value)} className="bg-inkwell border border-starlight/10 rounded-[8px] px-4 py-2 text-porcelain text-sm focus:outline-none focus:border-cyber-cyan/50">
            <option value="">All Types</option>
            {Constants.CLOTHING_TYPES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select value={season} onChange={e => setSeason(e.target.value)} className="bg-inkwell border border-starlight/10 rounded-[8px] px-4 py-2 text-porcelain text-sm focus:outline-none focus:border-cyber-cyan/50">
            <option value="">All Seasons</option>
            {Constants.SEASONS.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </Card>

        {/* Grid */}
        {isLoading ? (
          <div className="py-20 text-center text-cloudburst">Loading your wardrobe...</div>
        ) : items.length === 0 ? (
          <div className="py-20 text-center border border-dashed border-starlight/20 rounded-[16px]">
            <p className="text-cloudburst mb-4">No clothing items found.</p>
            <Button variant="ghost" onClick={() => router.push("/upload")}>Upload your first item</Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {items.map(item => (
              <Link href={`/wardrobe/${item.id}`} key={item.id}>
                <Card variant="translucent" className="h-full hover:border-cyber-cyan/30 transition-colors overflow-hidden group flex flex-col">
                  <div className="aspect-square bg-carbon relative overflow-hidden">
                    {item.front_image_url ? (
                      <img src={item.front_image_url} alt={item.type} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-cloudburst text-xs">No Image</div>
                    )}
                  </div>
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-sm font-medium text-porcelain truncate" title={item.brand ? `${item.brand} ${item.type}` : item.type}>
                          {item.brand ? <span className="text-cloudburst mr-1">{item.brand}</span> : null}
                          {item.type}
                        </h3>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-2">
                        <Badge variant="cyan">{item.category}</Badge>
                        <Badge variant="orange">{item.primary_color}</Badge>
                      </div>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
