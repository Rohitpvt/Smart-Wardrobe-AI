"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import PageHeader from "@/components/ui/PageHeader";
import WardrobeCard from "@/components/wardrobe/WardrobeCard";
import EmptyState from "@/components/ui/EmptyState";
import LoadingState from "@/components/ui/LoadingState";
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
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8">
      
      <PageHeader 
        title="My Wardrobe" 
        description="View and manage your digitized clothing collection."
        actions={
          <Button variant="filled" onClick={() => router.push("/upload")} className="bg-cyber-cyan text-carbon hover:bg-white">
            + Upload Item
          </Button>
        }
      />

      {/* Filters Toolbar */}
      <Card variant="translucent" className="p-4 flex flex-wrap gap-4 items-center animate-fade-in-up border border-starlight/10 z-20 relative">
        <div className="flex-1 min-w-[200px]">
          <input 
            type="text" 
            placeholder="Search brand, color, notes..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-inkwell border border-starlight/10 rounded-xl px-4 py-2.5 text-porcelain text-sm focus:outline-none focus:border-cyber-cyan/50 focus:ring-1 focus:ring-cyber-cyan/50 transition-colors"
          />
        </div>
        <select value={category} onChange={e => setCategory(e.target.value)} className="bg-inkwell border border-starlight/10 rounded-xl px-4 py-2.5 text-porcelain text-sm focus:outline-none focus:border-cyber-cyan/50 focus:ring-1 focus:ring-cyber-cyan/50 transition-colors">
          <option value="">All Categories</option>
          {Constants.CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select value={type} onChange={e => setType(e.target.value)} className="bg-inkwell border border-starlight/10 rounded-xl px-4 py-2.5 text-porcelain text-sm focus:outline-none focus:border-cyber-cyan/50 focus:ring-1 focus:ring-cyber-cyan/50 transition-colors">
          <option value="">All Types</option>
          {Constants.CLOTHING_TYPES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select value={season} onChange={e => setSeason(e.target.value)} className="bg-inkwell border border-starlight/10 rounded-xl px-4 py-2.5 text-porcelain text-sm focus:outline-none focus:border-cyber-cyan/50 focus:ring-1 focus:ring-cyber-cyan/50 transition-colors">
          <option value="">All Seasons</option>
          {Constants.SEASONS.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </Card>

      {/* Grid */}
      <div className="relative z-10 animate-fade-in">
        {isLoading ? (
          <LoadingState message="Loading your wardrobe..." />
        ) : items.length === 0 ? (
          <EmptyState 
            title={search || category || type || season ? "No matches found" : "Your wardrobe is empty"}
            description={search || category || type || season ? "Try adjusting your filters to find what you're looking for." : "Upload your first clothing item to start building your digital closet and get AI outfit recommendations."}
            actionLabel={search || category || type || season ? "Clear Filters" : "Upload Item"}
            onAction={() => {
              if (search || category || type || season) {
                setSearch(""); setCategory(""); setType(""); setSeason("");
              } else {
                router.push("/upload");
              }
            }}
          />
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {items.map(item => (
              <WardrobeCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
