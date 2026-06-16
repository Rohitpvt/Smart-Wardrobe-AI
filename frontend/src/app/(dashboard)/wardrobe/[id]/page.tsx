"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { api } from "@/lib/axios";
import { getImageUrl } from "@/lib/image-url";
import { toast } from "sonner";
import Image from "next/image";
import { ClothingItem, CATEGORIES, SEASONS } from "@/types/wardrobe";
import { m, Variants } from "framer-motion";
import { ArrowLeft, Edit2, Trash2, Tag, Layers, Droplets, Wind, Sparkles, AlertCircle, BarChart3, ScanFace } from "lucide-react";

import { fadeUp, staggerContainer as stagger } from "@/lib/animations";

export default function ClothingItemDetailPage(props: { params: Promise<{ id: string }> }) {
  const params = use(props.params);
  const router = useRouter();
  const queryClient = useQueryClient();
  const itemId = params.id;
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState<Record<string, string>>({});

  const { data: item, isLoading, error } = useQuery({
    queryKey: ["wardrobe", itemId],
    queryFn: async () => {
      const res = await api.get<ClothingItem>(`/wardrobe/${itemId}`);
      return res.data;
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: Record<string, string>) => api.put(`/wardrobe/${itemId}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wardrobe", itemId] });
      queryClient.invalidateQueries({ queryKey: ["wardrobe"] });
      setEditing(false);
      toast.success("Item updated successfully");
    },
    onError: () => {
      toast.error("Failed to update item");
    }
  });

  const deleteMutation = useMutation({
    mutationFn: () => api.delete(`/wardrobe/${itemId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wardrobe"] });
      toast.success("Item deleted successfully");
      router.push("/wardrobe");
    },
    onError: () => {
      toast.error("Failed to delete item");
    }
  });

  const startEditing = () => {
    if (!item) return;
    setEditData({
      name: item.name,
      clothing_type: item.clothing_type,
      category: item.category,
      color: item.color,
      pattern: item.pattern || "",
      material: item.material || "",
      season: item.season || "",
      brand: item.brand || "",
      notes: item.notes || "",
      purchase_price: item.purchase_price ? item.purchase_price.toString() : "",
      purchase_date: item.purchase_date || "",
    });
    setEditing(true);
  };

  const fields = [
    { key: "name", label: "Name", required: true },
    { key: "clothing_type", label: "Type", required: true },
    { key: "category", label: "Category", required: true, options: CATEGORIES },
    { key: "color", label: "Color", required: true },
    { key: "pattern", label: "Pattern" },
    { key: "material", label: "Material" },
    { key: "season", label: "Season", options: SEASONS },
    { key: "brand", label: "Brand" },
    { key: "purchase_price", label: "Purchase Price ($)", type: "number" },
    { key: "purchase_date", label: "Purchase Date", type: "date" },
    { key: "notes", label: "Notes" },
  ];

  /* ─── LOADING SKELETON (ZERO CLS) ─── */
  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto space-y-8 animate-pulse">
        {/* Breadcrumb Skeleton */}
        <div className="h-6 w-32 bg-white/5 rounded-lg mb-8" />
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Left Column Skeleton */}
          <div className="lg:col-span-5 space-y-6">
            <div className="aspect-[3/4] rounded-2xl bg-surface-1/70 border border-white/10" />
            <div className="grid grid-cols-3 gap-4">
              <div className="h-14 bg-surface-1/70 border border-white/10 rounded-xl" />
              <div className="h-14 bg-surface-1/70 border border-white/10 rounded-xl" />
              <div className="h-14 bg-surface-1/70 border border-white/10 rounded-xl" />
            </div>
          </div>
          
          {/* Right Column Skeleton */}
          <div className="lg:col-span-7 space-y-8">
            {/* Header */}
            <div>
              <div className="h-10 w-3/4 bg-surface-1/70 rounded-lg mb-4" />
              <div className="h-6 w-1/2 bg-surface-1/70 rounded-lg" />
            </div>
            
            {/* AI Panel Skeleton */}
            <div className="h-64 bg-surface-1/70 border border-white/10 rounded-2xl" />
            
            {/* Style Insights Skeleton */}
            <div className="grid grid-cols-2 gap-4">
               <div className="h-32 bg-surface-1/70 border border-white/10 rounded-2xl" />
               <div className="h-32 bg-surface-1/70 border border-white/10 rounded-2xl" />
               <div className="h-32 bg-surface-1/70 border border-white/10 rounded-2xl" />
               <div className="h-32 bg-surface-1/70 border border-white/10 rounded-2xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ─── ERROR STATE ─── */
  if (error || !item) {
    return (
      <div className="max-w-3xl mx-auto py-24 text-center rounded-2xl bg-surface-1/70 border border-white/10 backdrop-blur-xl">
        <div className="w-20 h-20 mx-auto rounded-2xl bg-red-500/10 flex items-center justify-center border border-white/5 mb-6">
          <AlertCircle className="w-10 h-10 text-red-400" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Item Not Found</h2>
        <p className="text-slate-400 mb-8 max-w-md mx-auto">This item may have been deleted or you don&apos;t have permission to view it.</p>
        <button
          onClick={() => router.push("/wardrobe")}
          className="ds-btn-primary px-8 py-3"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Wardrobe
        </button>
      </div>
    );
  }

  /* ─── CALCULATE AI CONFIDENCE / COMPLETENESS ─── */
  const totalFields = fields.length;
  const filledFields = fields.filter(f => item[f.key as keyof ClothingItem]).length;
  const completenessScore = Math.round((filledFields / totalFields) * 100);

  return (
    <m.div initial="hidden" animate="visible" variants={stagger} className="max-w-7xl mx-auto space-y-8 pb-16">
      
      {/* ═══ NAVIGATION ═══ */}
      <m.button
        variants={fadeUp}
        onClick={() => router.push("/wardrobe")}
        className="text-sm font-medium text-slate-400 hover:text-white flex items-center gap-2 transition-colors mb-2 group"
      >
        <div className="w-8 h-8 rounded-full bg-surface-2 border border-white/10 flex items-center justify-center group-hover:bg-surface-3 transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </div>
        Back to Wardrobe
      </m.button>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        
        {/* ═══ SECTION 1: HERO DETAIL (LEFT) ═══ */}
        <m.div variants={fadeUp} className="lg:col-span-5 space-y-6">
          <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-surface-2 border border-white/10 shadow-[0_0_50px_rgba(59,130,246,0.05)] group">
            {/* Ambient Image Glow */}
            <div className="absolute inset-0 bg-gradient-to-tr from-brand-blue/10 to-brand-purple/10 mix-blend-overlay z-10" />
            
            <Image
              src={getImageUrl(item.image_url) || ""}
              alt={item.name}
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              priority
              unoptimized={true}
              className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
            />
            
            {/* Floating Badges */}
            <div className="absolute top-4 left-4 right-4 flex justify-between z-20">
              <span className="px-3 py-1.5 rounded-lg bg-surface-1/80 backdrop-blur-md border border-white/10 text-xs font-label-sm text-white uppercase tracking-widest shadow-xl">
                {item.category}
              </span>
              {item.season && (
                <span className="px-3 py-1.5 rounded-lg bg-surface-1/80 backdrop-blur-md border border-white/10 text-xs font-label-sm text-brand-blue uppercase tracking-widest shadow-xl">
                  {item.season.replace("_", " ")}
                </span>
              )}
            </div>
            
            <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-background via-background/40 to-transparent z-10" />
          </div>

          {/* ═══ SECTION 4: QUICK ACTIONS ═══ */}
          {!editing && (
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={startEditing}
                className="flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl bg-surface-1/70 backdrop-blur-xl border border-white/10 text-white hover:-translate-y-1 hover:border-white/20 hover:shadow-[0_0_30px_rgba(59,130,246,0.15)] transition-all"
              >
                <Edit2 className="w-4 h-4 text-brand-blue" />
                <span className="text-sm font-medium">Edit Item</span>
              </button>
              <button
                onClick={() => {
                  toast.error("Are you sure you want to delete this item?", {
                    action: {
                      label: "Delete",
                      onClick: () => deleteMutation.mutate(),
                    },
                  });
                }}
                disabled={deleteMutation.isPending}
                className="flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl bg-surface-1/70 backdrop-blur-xl border border-red-500/20 text-white hover:-translate-y-1 hover:border-red-500/40 hover:shadow-[0_0_30px_rgba(239,68,68,0.15)] transition-all disabled:opacity-50"
              >
                <Trash2 className="w-4 h-4 text-red-400" />
                <span className="text-sm font-medium">{deleteMutation.isPending ? "Deleting..." : "Delete"}</span>
              </button>
            </div>
          )}
        </m.div>

        {/* ═══ SECTION 1: HERO DETAIL (RIGHT) ═══ */}
        <m.div variants={stagger} className="lg:col-span-7 space-y-8">
          
          {editing ? (
            <m.div variants={fadeUp} className="bg-surface-1/70 backdrop-blur-xl border border-white/10 rounded-2xl p-6 md:p-8 space-y-6 shadow-xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-brand-blue/15 flex items-center justify-center text-brand-blue border border-white/5">
                  <Edit2 className="w-5 h-5" />
                </div>
                <h2 className="text-2xl font-bold text-white tracking-tight">Edit Item Profile</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {fields.map((field) => (
                  <div key={field.key} className={field.key === "notes" ? "md:col-span-2" : ""}>
                    <label className="block text-xs font-label-sm text-slate-400 uppercase tracking-widest mb-2">
                      {field.label} {field.required && <span className="text-red-400">*</span>}
                    </label>
                    {field.options ? (
                      <select
                        value={editData[field.key] || ""}
                        onChange={(e) => setEditData((p) => ({ ...p, [field.key]: e.target.value }))}
                        className="w-full px-4 py-3 rounded-xl border border-white/10 bg-[#060816]/50 text-sm text-white focus:outline-none focus:ring-1 focus:ring-brand-blue/50 focus:border-brand-blue/50 transition-all appearance-none"
                      >
                        <option value="">Select...</option>
                        {field.options.map((o) => (
                          <option key={o} value={o}>{o.replace("_", " ")}</option>
                        ))}
                      </select>
                    ) : field.key === "notes" ? (
                      <textarea
                        value={editData[field.key] || ""}
                        onChange={(e) => setEditData((p) => ({ ...p, [field.key]: e.target.value }))}
                        rows={4}
                        className="w-full px-4 py-3 rounded-xl border border-white/10 bg-[#060816]/50 text-sm text-white focus:outline-none focus:ring-1 focus:ring-brand-blue/50 focus:border-brand-blue/50 transition-all resize-none"
                      />
                    ) : (
                      <input
                        type={field.type || "text"}
                        value={editData[field.key] || ""}
                        onChange={(e) => setEditData((p) => ({ ...p, [field.key]: e.target.value }))}
                        className="w-full px-4 py-3 rounded-xl border border-white/10 bg-[#060816]/50 text-sm text-white focus:outline-none focus:ring-1 focus:ring-brand-blue/50 focus:border-brand-blue/50 transition-all"
                      />
                    )}
                  </div>
                ))}
              </div>
              
              <div className="flex gap-4 pt-4 border-t border-white/10 mt-6">
                <button
                  onClick={() => updateMutation.mutate(editData)}
                  disabled={updateMutation.isPending}
                  className="ds-btn-primary px-8 py-3"
                >
                  {updateMutation.isPending ? "Saving..." : "Save Changes"}
                </button>
                <button
                  onClick={() => setEditing(false)}
                  className="ds-btn-secondary px-8 py-3"
                >
                  Cancel
                </button>
              </div>
            </m.div>
          ) : (
            <>
              {/* Header Info */}
              <m.div variants={fadeUp} className="relative pb-6 border-b border-white/10">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-brand-blue text-sm font-label-md tracking-wider uppercase">{item.brand || "Unknown Brand"}</span>
                  <span className="w-1 h-1 rounded-full bg-white/20" />
                  <span className="text-slate-400 text-sm">{new Date(item.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>
                <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight mb-4">{item.name}</h1>
                <p className="text-lg text-slate-300 leading-relaxed max-w-2xl">
                  {item.notes || "No additional notes provided for this item. Add notes to help the AI better understand how you wear this piece."}
                </p>
              </m.div>

              {/* ═══ SECTION 2: AI ANALYSIS PANEL ═══ */}
              <m.div variants={fadeUp} className="bg-surface-1/70 backdrop-blur-xl border border-white/10 rounded-2xl p-6 md:p-8 shadow-[0_0_30px_rgba(59,130,246,0.03)] relative overflow-hidden group hover:border-white/15 transition-colors">
                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-brand-purple/10 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none" />
                
                <div className="flex items-center justify-between mb-8 relative z-10">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-500/15 flex items-center justify-center text-brand-purple border border-white/5">
                      <ScanFace className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white tracking-tight">AI Analysis</h3>
                      <p className="text-xs text-slate-400">Extracted Metadata attributes</p>
                    </div>
                  </div>
                  
                  {/* AI Confidence Score Indicator */}
                  <div className="flex flex-col items-end">
                    <span className="text-3xl font-bold text-white">{completenessScore}%</span>
                    <span className="text-[10px] font-label-sm text-brand-purple uppercase tracking-widest">Metadata Score</span>
                  </div>
                </div>

                <div className="space-y-6 relative z-10">
                  {/* Progress Bar */}
                  <div>
                    <div className="flex justify-between text-xs mb-2">
                      <span className="text-slate-400">Data Completeness</span>
                      <span className="text-brand-purple">{completenessScore}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-surface-3 rounded-full overflow-hidden">
                      <m.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${completenessScore}%` }}
                        transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
                        className="h-full bg-gradient-to-r from-brand-blue to-brand-purple rounded-full"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-white/5">
                    <div>
                      <p className="text-[10px] font-label-sm text-slate-500 uppercase tracking-widest mb-1">Color</p>
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full border border-white/20 shadow-inner" style={{ backgroundColor: item.color.toLowerCase() }} />
                        <span className="text-sm font-medium text-white">{item.color}</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-[10px] font-label-sm text-slate-500 uppercase tracking-widest mb-1">Material</p>
                      <span className="text-sm font-medium text-white">{item.material || "—"}</span>
                    </div>
                    <div>
                      <p className="text-[10px] font-label-sm text-slate-500 uppercase tracking-widest mb-1">Pattern</p>
                      <span className="text-sm font-medium text-white">{item.pattern || "—"}</span>
                    </div>
                    <div>
                      <p className="text-[10px] font-label-sm text-slate-500 uppercase tracking-widest mb-1">Type</p>
                      <span className="text-sm font-medium text-white truncate block">{item.clothing_type}</span>
                    </div>
                  </div>
                </div>
              </m.div>

              {/* ═══ SECTION 3: STYLE INSIGHTS ═══ */}
              <m.div variants={stagger} className="grid grid-cols-2 gap-4 md:gap-6">
                <m.div variants={fadeUp} className="bg-surface-1/70 backdrop-blur-xl border border-white/10 rounded-2xl p-5 hover:-translate-y-1 hover:border-white/15 transition-all shadow-[0_0_20px_rgba(59,130,246,0.02)]">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/15 flex items-center justify-center text-blue-400 mb-4">
                    <Layers className="w-4 h-4" />
                  </div>
                  <p className="text-[10px] font-label-sm text-slate-400 uppercase tracking-widest mb-1">Classification</p>
                  <p className="text-lg font-semibold text-white">{item.category}</p>
                </m.div>

                <m.div variants={fadeUp} className="bg-surface-1/70 backdrop-blur-xl border border-white/10 rounded-2xl p-5 hover:-translate-y-1 hover:border-white/15 transition-all shadow-[0_0_20px_rgba(59,130,246,0.02)]">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/15 flex items-center justify-center text-emerald-400 mb-4">
                    <Wind className="w-4 h-4" />
                  </div>
                  <p className="text-[10px] font-label-sm text-slate-400 uppercase tracking-widest mb-1">Season Suitability</p>
                  <p className="text-lg font-semibold text-white">{item.season ? item.season.replace("_", " ") : "All Season"}</p>
                </m.div>
                
                <m.div variants={fadeUp} className="bg-surface-1/70 backdrop-blur-xl border border-white/10 rounded-2xl p-5 hover:-translate-y-1 hover:border-white/15 transition-all shadow-[0_0_20px_rgba(59,130,246,0.02)]">
                  <div className="w-8 h-8 rounded-lg bg-cyan-500/15 flex items-center justify-center text-cyan-400 mb-4">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <p className="text-[10px] font-label-sm text-slate-400 uppercase tracking-widest mb-1">Wardrobe Role</p>
                  <p className="text-lg font-semibold text-white">{item.brand ? "Statement Piece" : "Core Basic"}</p>
                </m.div>

                <m.div variants={fadeUp} className="bg-surface-1/70 backdrop-blur-xl border border-white/10 rounded-2xl p-5 hover:-translate-y-1 hover:border-white/15 transition-all shadow-[0_0_20px_rgba(59,130,246,0.02)]">
                  <div className="w-8 h-8 rounded-lg bg-purple-500/15 flex items-center justify-center text-purple-400 mb-4">
                    <BarChart3 className="w-4 h-4" />
                  </div>
                  <p className="text-[10px] font-label-sm text-slate-400 uppercase tracking-widest mb-1">Total Wears</p>
                  <p className="text-lg font-semibold text-white">{item.worn_count || 0}</p>
                </m.div>
              </m.div>

              {/* ═══ SECTION 5: RELATED ITEMS PLACEHOLDER ═══ */}
              <m.div variants={fadeUp} className="bg-surface-2/50 border border-white/5 rounded-2xl p-8 flex flex-col items-center justify-center text-center opacity-70">
                <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-slate-500 mb-4 border border-white/5">
                  <Droplets className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-medium text-slate-300 mb-1">AI Related Pieces</h3>
                <p className="text-sm text-slate-500 max-w-sm">
                  Our models are learning your style. Personalized outfit pairings for this item will appear here soon.
                </p>
              </m.div>
            </>
          )}
        </m.div>
      </div>
    </m.div>
  );
}
