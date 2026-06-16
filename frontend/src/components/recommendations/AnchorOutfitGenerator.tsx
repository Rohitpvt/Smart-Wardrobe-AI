"use client";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery, useMutation } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import { ClothingItemMinimal } from "@/types/recommendations";
import { OutfitCompletionCard } from "./OutfitCompletionCard";
import { Sparkles, Loader2, Target, AlertCircle, Anchor, Search, CheckCircle2 } from "lucide-react";
import { m, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { getImageUrl } from "@/lib/image-url";

const OCCASIONS = ["CASUAL", "COLLEGE", "OFFICE", "PARTY", "FORMAL"];

export function AnchorOutfitGenerator() {
  const searchParams = useSearchParams();
  const keyword = searchParams.get("keyword") || "";

  const [occasion, setOccasion] = useState(OCCASIONS[0]);
  const [searchQuery, setSearchQuery] = useState(keyword);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [completionData, setCompletionData] = useState<any | null>(null);

  // Fetch Wardrobe
  const { data: wardrobeResponse, isLoading: isLoadingWardrobe } = useQuery({
    queryKey: ["wardrobe-items", { page: 1, pageSize: 100 }],
    queryFn: async () => {
      const res = await api.get("/wardrobe?page=1&page_size=100");
      return res.data;
    }
  });

  const allItems: ClothingItemMinimal[] = wardrobeResponse?.data || [];
  
  // Filter items
  const filteredItems = allItems.filter(item => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return item.name.toLowerCase().includes(q) || 
           item.category.toLowerCase().includes(q) || 
           item.color.toLowerCase().includes(q);
  });

  // Auto-select if there's an exact keyword match
  useEffect(() => {
    if (keyword && filteredItems.length > 0 && !selectedItemId) {
      setSelectedItemId(filteredItems[0].id);
    }
  }, [keyword, filteredItems, selectedItemId]);

  const mutation = useMutation({
    mutationFn: async () => {
      const res = await api.post("/recommendations/build-around", {
        anchor_item_id: selectedItemId,
        occasion
      });
      return res.data;
    },
    onSuccess: (data) => {
      setCompletionData(data.data);
      setErrorMsg(null);
    },
    onError: (error: any) => {
      setErrorMsg(error.response?.data?.detail?.message || "Our AI encountered a temporary issue generating your recommendation.");
    }
  });

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItemId) {
      setErrorMsg("Please select an anchor item first.");
      return;
    }
    setErrorMsg(null);
    setCompletionData(null);
    mutation.mutate();
  };

  return (
    <div className="space-y-8">
      <m.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-surface-1/70 backdrop-blur-xl border border-white/10 rounded-3xl p-8 lg:p-10 shadow-[0_0_50px_rgba(139,92,246,0.03)] relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-brand-purple/10 via-brand-blue/5 to-transparent rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3 pointer-events-none transition-opacity duration-1000" />
        
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left: AI Context & Wardrobe Selection */}
          <div className="lg:col-span-7 space-y-6">
            <div className="space-y-4 mb-8">
              <div className="flex items-center gap-2 mb-2">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-brand-purple/15 text-brand-purple border border-brand-purple/20">
                  <Anchor className="w-5 h-5" />
                </div>
                <span className="text-xs font-label-md text-brand-purple tracking-widest uppercase font-semibold">Outfit Builder</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight">Build Around an Item</h2>
              <p className="text-lg text-slate-300 leading-relaxed max-w-xl">
                Select an anchor item from your wardrobe. Our AI will curate a complete, weather-appropriate outfit around it.
              </p>
            </div>

            {/* Selector */}
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input 
                  type="text" 
                  placeholder="Search wardrobe..." 
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full bg-[#060816]/80 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-white focus:outline-none focus:ring-1 focus:ring-brand-purple/50 focus:border-brand-purple/50 transition-all shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)]" 
                />
              </div>

              <div className="h-64 overflow-y-auto bg-surface-2/50 rounded-2xl border border-white/5 p-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {isLoadingWardrobe ? (
                  <div className="col-span-full flex justify-center items-center h-full text-white/50">
                    <Loader2 className="w-6 h-6 animate-spin" />
                  </div>
                ) : filteredItems.length === 0 ? (
                  <div className="col-span-full text-center text-white/50 text-sm mt-8">No items found.</div>
                ) : (
                  filteredItems.map(item => (
                    <button 
                      key={item.id}
                      onClick={() => setSelectedItemId(item.id)}
                      className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all ${selectedItemId === item.id ? 'border-brand-purple shadow-[0_0_15px_rgba(139,92,246,0.3)] scale-95' : 'border-transparent hover:border-white/20'}`}
                    >
                      {item.image_url ? (
                        <Image src={getImageUrl(item.image_url) || ""} alt={item.name} fill className="object-cover" unoptimized />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-surface-3">👕</div>
                      )}
                      <div className="absolute inset-x-0 bottom-0 bg-black/60 p-2 truncate text-[10px] text-white/90">
                        {item.name}
                      </div>
                      {selectedItemId === item.id && (
                        <div className="absolute top-2 right-2 bg-brand-purple text-white rounded-full p-0.5">
                          <CheckCircle2 className="w-4 h-4" />
                        </div>
                      )}
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Right: Controls */}
          <div className="lg:col-span-5 flex flex-col justify-center">
            <form onSubmit={handleGenerate} className="bg-surface-2/80 backdrop-blur-md border border-brand-purple/20 rounded-2xl p-6 shadow-xl space-y-6">
              <div>
                <label htmlFor="occasion" className="flex items-center gap-2 text-xs font-label-md text-slate-400 uppercase tracking-widest mb-3">
                  <Target className="w-4 h-4" />
                  Target Occasion
                </label>
                <select
                  id="occasion"
                  value={occasion}
                  onChange={(e) => setOccasion(e.target.value)}
                  disabled={mutation.isPending}
                  className="w-full bg-[#060816]/80 border border-white/10 text-white rounded-xl px-5 py-4 focus:outline-none focus:ring-1 focus:ring-brand-purple/50 focus:border-brand-purple/50 disabled:opacity-50 appearance-none shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)] transition-all cursor-pointer"
                >
                  {OCCASIONS.map((occ) => (
                    <option key={occ} value={occ}>
                      {occ.charAt(0) + occ.slice(1).toLowerCase()}
                    </option>
                  ))}
                </select>
              </div>
              
              <button
                type="submit"
                disabled={mutation.isPending || !selectedItemId}
                className={`w-full py-4 text-base font-semibold rounded-xl text-white transition-all 
                  ${mutation.isPending || !selectedItemId 
                    ? 'bg-brand-purple/50 cursor-not-allowed opacity-50' 
                    : 'bg-brand-purple hover:bg-brand-purple/90 shadow-[0_0_20px_rgba(139,92,246,0.3)] hover:shadow-[0_0_30px_rgba(139,92,246,0.5)]'}`}
              >
                {mutation.isPending ? (
                  <span className="flex items-center justify-center">
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    Synthesizing Outfit...
                  </span>
                ) : (
                  <span className="flex items-center justify-center">
                    <Sparkles className="w-5 h-5 mr-2" />
                    Build Outfit
                  </span>
                )}
              </button>
            </form>

            {errorMsg && (
              <m.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 p-6 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-start gap-4 relative z-10"
              >
                <div className="p-2 bg-red-500/20 rounded-lg text-red-400 shrink-0">
                  <AlertCircle className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-red-400 font-semibold mb-1">Stylist Error</h4>
                  <p className="text-red-300/80 text-sm leading-relaxed">{errorMsg}</p>
                </div>
              </m.div>
            )}
          </div>
        </div>
      </m.div>

      <AnimatePresence>
        {completionData && (
          <m.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-center"
          >
            <OutfitCompletionCard data={completionData} />
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );
}
