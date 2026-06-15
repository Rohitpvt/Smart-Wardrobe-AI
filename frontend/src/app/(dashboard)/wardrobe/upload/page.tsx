"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import axios from "axios";
import { CATEGORIES, SEASONS } from "@/types/wardrobe";
import { toast } from "sonner";
import Image from "next/image";
import { m, Variants, AnimatePresence } from "framer-motion";
import { UploadCloud, Image as ImageIcon, Zap, ScanFace, CheckCircle2, ShieldCheck, FileImage, Sparkles, Layers, Tag, Droplet } from "lucide-react";

type Step = "select" | "analyzing" | "review";

import { fadeUp, staggerContainer as stagger } from "@/lib/animations";

export default function UploadPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [step, setStep] = useState<Step>("select");
  const [preview, setPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [confidence, setConfidence] = useState<number | null>(null);
  const [isAiGenerated, setIsAiGenerated] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    clothing_type: "",
    category: "",
    color: "",
    pattern: "",
    material: "",
    season: "",
    brand: "",
    notes: "",
    purchase_price: "",
    purchase_date: "",
  });

  const analyzeMutation = useMutation({
    mutationFn: async (file: File) => {
      const data = new FormData();
      data.append("image", file);
      const res = await api.post("/uploads/analyze", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data;
    },
    onSuccess: (data) => {
      setFormData({
        name: data.name || "",
        clothing_type: data.clothing_type || "",
        category: data.category || "",
        color: data.color || "",
        pattern: data.pattern || "",
        material: data.material || "",
        season: data.season || "",
        brand: data.brand || "",
        notes: "",
        purchase_price: "",
        purchase_date: "",
      });
      setConfidence(data.confidence_score);
      setIsAiGenerated(true);
      setStep("review");
    },
    onError: (error: unknown) => {
      let msg = "AI analysis failed. Please enter details manually.";
      if (axios.isAxiosError(error)) {
        msg = error.response?.data?.detail || msg;
      }
      toast.error(msg);
      // Fallback to manual entry
      setStep("review");
    },
  });

  const handleFileSelect = useCallback((file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB");
      return;
    }
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      toast.error("File must be JPEG, PNG, or WEBP");
      return;
    }
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(file);
    
    // Automatically trigger analysis
    setStep("analyzing");
    analyzeMutation.mutate(file);
  }, [analyzeMutation]);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragActive(false);
      if (e.dataTransfer.files[0]) {
        handleFileSelect(e.dataTransfer.files[0]);
      }
    },
    [handleFileSelect]
  );

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!selectedFile) throw new Error("No file selected");
      const data = new FormData();
      data.append("image", selectedFile);
      Object.entries(formData).forEach(([key, value]) => {
        if (value) data.append(key, value);
      });
      if (confidence !== null) {
        data.append("ai_confidence", confidence.toString());
      }
      data.append("ai_generated", isAiGenerated.toString());
      
      return api.post("/wardrobe", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    },
    onSuccess: () => {
      toast.success("Item saved to wardrobe!");
      router.push("/wardrobe");
    },
    onError: (error: unknown) => {
      let msg = "Upload failed";
      if (axios.isAxiosError(error)) {
        msg = error.response?.data?.detail || msg;
      }
      toast.error(msg);
    },
  });

  const isFormValid = selectedFile && formData.name && formData.clothing_type && formData.category && formData.color;

  const getFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16">
      {/* ═══ SECTION 1: UPLOAD HERO ═══ */}
      <m.section
        initial="hidden"
        animate="visible"
        variants={fadeUp}
        className="relative overflow-hidden rounded-2xl p-8 md:p-12 bg-surface-1/70 backdrop-blur-xl border border-white/10 shadow-[0_0_50px_rgba(59,130,246,0.03)]"
      >
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-brand-blue/10 via-brand-purple/5 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none" />
        
        <div className="relative z-10 max-w-2xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-brand-blue/15 border border-white/5 flex items-center justify-center text-brand-blue">
              <ScanFace className="w-5 h-5" />
            </div>
            <span className="text-sm font-label-md text-brand-blue tracking-widest uppercase">AI Ingestion</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight mb-4">
            Upload New Garment
          </h1>
          <p className="text-lg text-slate-300 leading-relaxed mb-8">
            Add a new piece to your digital wardrobe. Our AI will automatically extract metadata like category, color, material, and season in seconds.
          </p>
          
          <div className="flex flex-wrap gap-4 text-xs font-label-sm text-slate-400">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-2 border border-white/5">
              <FileImage className="w-4 h-4 text-slate-500" />
              JPG, PNG, WEBP
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-2 border border-white/5">
              <ShieldCheck className="w-4 h-4 text-emerald-500/70" />
              Secure & Private
            </div>
          </div>
        </div>
      </m.section>

      <AnimatePresence mode="wait">
        {step === "select" && (
          <m.div
            key="select"
            initial="hidden"
            animate="visible"
            exit={{ opacity: 0, y: -20, transition: { duration: 0.3 } }}
            variants={fadeUp}
          >
            {/* ═══ SECTION 2: UPLOAD DROPZONE ═══ */}
            <div
              onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
              onDragLeave={() => setDragActive(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`relative group rounded-3xl p-16 md:p-24 text-center cursor-pointer transition-all duration-500 border-2 overflow-hidden bg-surface-1/40 backdrop-blur-sm ${
                dragActive
                  ? "border-brand-blue/50 bg-brand-blue/5 shadow-[0_0_50px_rgba(59,130,246,0.15)] scale-[1.01]"
                  : "border-dashed border-white/10 hover:border-brand-blue/30 hover:bg-surface-2 hover:shadow-[0_0_30px_rgba(59,130,246,0.05)]"
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".jpg,.jpeg,.png,.webp"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                aria-label="Upload garment image"
              />
              
              <div className="relative z-10 flex flex-col items-center justify-center space-y-6 pointer-events-none">
                <div className={`w-24 h-24 rounded-2xl flex items-center justify-center transition-all duration-500 ${dragActive ? 'bg-brand-blue border border-white/20 scale-110 shadow-xl text-white' : 'bg-surface-3 border border-white/5 text-slate-400 group-hover:text-brand-blue group-hover:scale-105'}`}>
                  <UploadCloud className="w-10 h-10" />
                </div>
                
                <div>
                  <h3 className={`text-2xl font-bold mb-2 transition-colors duration-300 ${dragActive ? 'text-brand-blue' : 'text-white'}`}>
                    Drag & drop your image here
                  </h3>
                  <p className="text-slate-400">
                    or <span className="text-brand-blue">browse files</span> from your device
                  </p>
                </div>
                
                <p className="text-xs font-label-sm text-slate-500 uppercase tracking-widest pt-4 border-t border-white/10 w-48 mx-auto">
                  Maximum file size: 5MB
                </p>
              </div>

              {/* Drag ambient effect */}
              <div className={`absolute inset-0 bg-gradient-to-t from-brand-blue/10 to-transparent opacity-0 transition-opacity duration-500 ${dragActive ? 'opacity-100' : ''}`} />
            </div>
          </m.div>
        )}

        {step === "analyzing" && (
          <m.div
            key="analyzing"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, y: -20, transition: { duration: 0.3 } }}
            className="rounded-3xl p-16 md:p-24 text-center bg-surface-1/70 backdrop-blur-xl border border-white/10 shadow-[0_0_100px_rgba(59,130,246,0.1)] relative overflow-hidden"
          >
            {/* Scanning Laser Effect */}
            <div className="absolute top-0 left-0 w-full h-1 bg-brand-blue/50 shadow-[0_0_20px_rgba(59,130,246,1)] animate-pulse" />
            <div className="absolute top-0 right-0 w-96 h-96 bg-brand-purple/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 animate-pulse" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-brand-blue/10 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2 animate-pulse" />

            <div className="relative z-10 flex flex-col items-center justify-center space-y-8">
              {/* Preview with scanning overlay */}
              <div className="relative w-48 h-48 rounded-2xl overflow-hidden border border-white/20 shadow-2xl">
                {preview ? (
                  <Image src={preview} alt="Analyzing preview" fill unoptimized={true} className="object-cover" />
                ) : (
                  <div className="w-full h-full bg-surface-3" />
                )}
                <div className="absolute inset-0 bg-gradient-to-b from-brand-blue/20 to-transparent mix-blend-overlay animate-pulse" />
                <div className="absolute inset-0 border-4 border-brand-blue/30 rounded-2xl border-t-brand-blue animate-spin" />
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-center gap-2 text-brand-blue mb-2">
                  <Zap className="w-5 h-5 fill-current animate-pulse" />
                  <h3 className="text-2xl font-bold tracking-tight">AI Analysis in Progress</h3>
                </div>
                <p className="text-slate-400 max-w-md mx-auto">
                  Our intelligence engine is currently extracting structural metadata, categorizing items, and identifying styling attributes...
                </p>
              </div>
            </div>
          </m.div>
        )}

        {step === "review" && (
          <m.div
            key="review"
            initial="hidden"
            animate="visible"
            variants={stagger}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12"
          >
            {/* ═══ SECTION 4: IMAGE PREVIEW (LEFT) ═══ */}
            <m.div variants={fadeUp} className="lg:col-span-5 space-y-6">
              <div className="bg-surface-1/70 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-xl">
                <div className="aspect-[3/4] rounded-xl overflow-hidden bg-surface-2 relative group mb-4 border border-white/5">
                  {preview && (
                    <Image src={preview} alt="Upload preview" fill unoptimized={true} className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
                
                <div className="px-2 pb-2">
                  <div className="flex items-center gap-3 text-sm text-slate-400 mb-4">
                    <ImageIcon className="w-4 h-4" />
                    <span className="truncate flex-1">{selectedFile?.name || "Uploaded Image"}</span>
                    <span>{selectedFile ? getFileSize(selectedFile.size) : ""}</span>
                  </div>
                  
                  <button
                    onClick={() => {
                      setSelectedFile(null);
                      setPreview(null);
                      setStep("select");
                    }}
                    className="w-full py-3 rounded-xl border border-white/10 text-white font-medium hover:bg-surface-3 hover:border-white/20 transition-all text-sm"
                  >
                    Choose Different Image
                  </button>
                </div>
              </div>
            </m.div>

            {/* ═══ SECTION 5: AI ANALYSIS RESULTS (RIGHT) ═══ */}
            <m.div variants={stagger} className="lg:col-span-7 space-y-8">
              
              {/* Review Header */}
              <m.div variants={fadeUp} className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold text-white tracking-tight mb-2">Review Intelligence</h2>
                  <p className="text-slate-400">Verify the extracted metadata and finalize your item details.</p>
                </div>
                {confidence !== null && (
                  <div className={`flex flex-col items-end px-4 py-2 rounded-xl border ${confidence >= 80 ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-yellow-500/10 border-yellow-500/20'}`}>
                    <span className={`text-2xl font-bold ${confidence >= 80 ? 'text-emerald-400' : 'text-yellow-400'}`}>{confidence}%</span>
                    <span className="text-[10px] font-label-sm uppercase tracking-widest text-slate-400">AI Confidence</span>
                  </div>
                )}
              </m.div>

              {/* Form Grid */}
              <m.div variants={fadeUp} className="bg-surface-1/70 backdrop-blur-xl border border-white/10 rounded-2xl p-6 md:p-8 shadow-xl">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Name */}
                  <div className="md:col-span-2">
                    <label className="block text-xs font-label-sm text-slate-400 uppercase tracking-widest mb-2">
                      Item Name <span className="text-brand-blue">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                      placeholder="e.g. Classic Denim Jacket"
                      className="w-full px-4 py-3 rounded-xl border border-white/10 bg-[#060816]/50 text-sm text-white focus:outline-none focus:ring-1 focus:ring-brand-blue/50 focus:border-brand-blue/50 transition-all shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)]"
                    />
                  </div>

                  {/* Clothing Type */}
                  <div>
                    <label className="block text-xs font-label-sm text-slate-400 uppercase tracking-widest mb-2">
                      Specific Type <span className="text-brand-blue">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.clothing_type}
                      onChange={(e) => setFormData((p) => ({ ...p, clothing_type: e.target.value }))}
                      placeholder="e.g. Graphic Tee"
                      className="w-full px-4 py-3 rounded-xl border border-white/10 bg-[#060816]/50 text-sm text-white focus:outline-none focus:ring-1 focus:ring-brand-blue/50 focus:border-brand-blue/50 transition-all"
                    />
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-xs font-label-sm text-slate-400 uppercase tracking-widest mb-2">
                      Category <span className="text-brand-blue">*</span>
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData((p) => ({ ...p, category: e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl border border-white/10 bg-[#060816]/50 text-sm text-white focus:outline-none focus:ring-1 focus:ring-brand-blue/50 focus:border-brand-blue/50 transition-all appearance-none"
                    >
                      <option value="">Select category...</option>
                      {CATEGORIES.map((c) => (
                        <option key={c} value={c}>{c.charAt(0) + c.slice(1).toLowerCase()}</option>
                      ))}
                    </select>
                  </div>

                  {/* Color */}
                  <div>
                    <label className="block text-xs font-label-sm text-slate-400 uppercase tracking-widest mb-2">
                      Primary Color <span className="text-brand-blue">*</span>
                    </label>
                    <div className="relative">
                      {formData.color && (
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border border-white/20 shadow-inner z-10" style={{ backgroundColor: formData.color.toLowerCase() }} />
                      )}
                      <input
                        type="text"
                        value={formData.color}
                        onChange={(e) => setFormData((p) => ({ ...p, color: e.target.value }))}
                        placeholder="e.g. Navy Blue"
                        className={`w-full py-3 rounded-xl border border-white/10 bg-[#060816]/50 text-sm text-white focus:outline-none focus:ring-1 focus:ring-brand-blue/50 focus:border-brand-blue/50 transition-all pr-4 ${formData.color ? 'pl-11' : 'pl-4'}`}
                      />
                    </div>
                  </div>

                  {/* Season */}
                  <div>
                    <label className="block text-xs font-label-sm text-slate-400 uppercase tracking-widest mb-2">
                      Season
                    </label>
                    <select
                      value={formData.season}
                      onChange={(e) => setFormData((p) => ({ ...p, season: e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl border border-white/10 bg-[#060816]/50 text-sm text-white focus:outline-none focus:ring-1 focus:ring-brand-blue/50 focus:border-brand-blue/50 transition-all appearance-none"
                    >
                      <option value="">Select season...</option>
                      {SEASONS.map((s) => (
                        <option key={s} value={s}>{s.replace("_", " ").charAt(0) + s.replace("_", " ").slice(1).toLowerCase()}</option>
                      ))}
                    </select>
                  </div>

                  {/* Pattern */}
                  <div>
                    <label className="block text-xs font-label-sm text-slate-400 uppercase tracking-widest mb-2">
                      Pattern
                    </label>
                    <input
                      type="text"
                      value={formData.pattern}
                      onChange={(e) => setFormData((p) => ({ ...p, pattern: e.target.value }))}
                      placeholder="e.g. Solid"
                      className="w-full px-4 py-3 rounded-xl border border-white/10 bg-[#060816]/50 text-sm text-white focus:outline-none focus:ring-1 focus:ring-brand-blue/50 focus:border-brand-blue/50 transition-all"
                    />
                  </div>

                  {/* Material */}
                  <div>
                    <label className="block text-xs font-label-sm text-slate-400 uppercase tracking-widest mb-2">
                      Material
                    </label>
                    <input
                      type="text"
                      value={formData.material}
                      onChange={(e) => setFormData((p) => ({ ...p, material: e.target.value }))}
                      placeholder="e.g. Cotton"
                      className="w-full px-4 py-3 rounded-xl border border-white/10 bg-[#060816]/50 text-sm text-white focus:outline-none focus:ring-1 focus:ring-brand-blue/50 focus:border-brand-blue/50 transition-all"
                    />
                  </div>

                  {/* Brand */}
                  <div className="md:col-span-2">
                    <label className="block text-xs font-label-sm text-slate-400 uppercase tracking-widest mb-2">
                      Brand
                    </label>
                    <input
                      type="text"
                      value={formData.brand}
                      onChange={(e) => setFormData((p) => ({ ...p, brand: e.target.value }))}
                      placeholder="e.g. Nike"
                      className="w-full px-4 py-3 rounded-xl border border-white/10 bg-[#060816]/50 text-sm text-white focus:outline-none focus:ring-1 focus:ring-brand-blue/50 focus:border-brand-blue/50 transition-all"
                    />
                  </div>

                  {/* Purchase Price */}
                  <div>
                    <label className="block text-xs font-label-sm text-slate-400 uppercase tracking-widest mb-2">
                      Purchase Price ($)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.purchase_price}
                      onChange={(e) => setFormData((p) => ({ ...p, purchase_price: e.target.value }))}
                      placeholder="e.g. 59.99"
                      className="w-full px-4 py-3 rounded-xl border border-white/10 bg-[#060816]/50 text-sm text-white focus:outline-none focus:ring-1 focus:ring-brand-blue/50 focus:border-brand-blue/50 transition-all"
                    />
                  </div>

                  {/* Purchase Date */}
                  <div>
                    <label className="block text-xs font-label-sm text-slate-400 uppercase tracking-widest mb-2">
                      Purchase Date
                    </label>
                    <input
                      type="date"
                      value={formData.purchase_date}
                      onChange={(e) => setFormData((p) => ({ ...p, purchase_date: e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl border border-white/10 bg-[#060816]/50 text-sm text-white focus:outline-none focus:ring-1 focus:ring-brand-blue/50 focus:border-brand-blue/50 transition-all"
                    />
                  </div>

                  {/* Notes */}
                  <div className="md:col-span-2">
                    <label className="block text-xs font-label-sm text-slate-400 uppercase tracking-widest mb-2">
                      Additional Notes
                    </label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => setFormData((p) => ({ ...p, notes: e.target.value }))}
                      placeholder="Add any styling tips or fit notes..."
                      rows={3}
                      className="w-full px-4 py-3 rounded-xl border border-white/10 bg-[#060816]/50 text-sm text-white focus:outline-none focus:ring-1 focus:ring-brand-blue/50 focus:border-brand-blue/50 transition-all resize-none"
                    />
                  </div>
                </div>
              </m.div>

              {/* ═══ SECTION 6: CONFIRMATION AREA ═══ */}
              <m.div variants={fadeUp} className="bg-surface-1/70 backdrop-blur-xl border border-brand-blue/20 rounded-2xl p-6 md:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-[0_0_30px_rgba(59,130,246,0.1)] relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-brand-blue/5 to-transparent pointer-events-none" />
                <div className="relative z-10">
                  <h3 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    Review Complete
                  </h3>
                  <p className="text-sm text-slate-400 max-w-md">
                    Metadata extraction successful. Ensure required fields are populated before saving to your digital wardrobe.
                  </p>
                </div>
                
                <div className="relative z-10 flex gap-3 w-full sm:w-auto">
                  <button
                    onClick={() => router.push("/wardrobe")}
                    className="flex-1 sm:flex-none ds-btn-secondary px-6 py-3"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => saveMutation.mutate()}
                    disabled={!isFormValid || saveMutation.isPending}
                    className="flex-1 sm:flex-none ds-btn-primary px-8 py-3 shadow-[0_0_20px_rgba(59,130,246,0.3)] disabled:opacity-50 disabled:shadow-none"
                  >
                    {saveMutation.isPending ? "Saving..." : "Save to Wardrobe"}
                  </button>
                </div>
              </m.div>

            </m.div>
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );
}
