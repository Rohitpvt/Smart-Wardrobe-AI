"use client";

import { useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import { CATEGORIES, SEASONS } from "@/types/wardrobe";

type Step = "select" | "analyzing" | "review";

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
      });
      setConfidence(data.confidence_score);
      setIsAiGenerated(true);
      setStep("review");
    },
    onError: (error: any) => {
      const msg = error.response?.data?.detail || "AI analysis failed. Please enter details manually.";
      alert(msg);
      // Fallback to manual entry
      setStep("review");
    },
  });

  const handleFileSelect = useCallback((file: File) => {
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
      router.push("/wardrobe");
    },
    onError: (error: any) => {
      const msg = error.response?.data?.detail || "Upload failed";
      alert(msg);
    },
  });

  const isFormValid = selectedFile && formData.name && formData.clothing_type && formData.category && formData.color;

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Upload Clothing</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          Add a new item to your wardrobe
        </p>
      </div>

      {step === "select" && (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
          onDragLeave={() => setDragActive(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-xl p-16 text-center cursor-pointer transition-all ${
            dragActive
              ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
              : "border-zinc-300 dark:border-zinc-700 hover:border-zinc-400 dark:hover:border-zinc-600"
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".jpg,.jpeg,.png,.webp"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
          />
          <div className="space-y-4">
            <div className="mx-auto w-16 h-16 bg-blue-50 dark:bg-zinc-800 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
            </div>
            <div>
              <p className="text-lg font-medium text-zinc-900 dark:text-zinc-100">
                Click to upload or drag and drop
              </p>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                JPG, PNG, WEBP (max. 10MB)
              </p>
            </div>
          </div>
        </div>
      )}

      {step === "analyzing" && (
        <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl p-12 text-center bg-white dark:bg-zinc-950 shadow-sm">
          {preview && (
            <img src={preview} alt="Preview" className="mx-auto w-48 h-48 object-cover rounded-xl shadow-sm mb-8 opacity-50" />
          )}
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 border-4 border-zinc-100 dark:border-zinc-800 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
            </div>
            <div>
              <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100">
                AI is analyzing your clothing...
              </h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                Extracting category, color, material, and more.
              </p>
            </div>
          </div>
        </div>
      )}

      {step === "review" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-1 space-y-4">
            {preview && (
              <img src={preview} alt="Preview" className="w-full aspect-square object-cover rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800" />
            )}
            <button
              onClick={() => {
                setSelectedFile(null);
                setPreview(null);
                setStep("select");
              }}
              className="w-full px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-lg transition-colors"
            >
              Choose different image
            </button>
            
            {confidence !== null && (
              <div className={`p-4 rounded-xl border ${confidence >= 80 ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800' : 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800'}`}>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${confidence >= 80 ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                  <span className={`text-sm font-medium ${confidence >= 80 ? 'text-green-800 dark:text-green-300' : 'text-yellow-800 dark:text-yellow-300'}`}>
                    AI Confidence: {confidence}%
                  </span>
                </div>
                {confidence < 80 && (
                  <p className="text-xs text-yellow-700 dark:text-yellow-400 mt-2">
                    The AI was not entirely sure about some details. Please review carefully.
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="md:col-span-2 space-y-6 bg-white dark:bg-zinc-950 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
            <div>
              <h2 className="text-lg font-medium text-zinc-900 dark:text-zinc-100">Review Details</h2>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">Make any necessary corrections before saving.</p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                  placeholder="e.g. Blue Denim Jacket"
                  className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Clothing Type *</label>
                <input
                  type="text"
                  value={formData.clothing_type}
                  onChange={(e) => setFormData((p) => ({ ...p, clothing_type: e.target.value }))}
                  placeholder="e.g. T-Shirt"
                  className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Category *</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData((p) => ({ ...p, category: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select category</option>
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c.charAt(0) + c.slice(1).toLowerCase()}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Color *</label>
                <input
                  type="text"
                  value={formData.color}
                  onChange={(e) => setFormData((p) => ({ ...p, color: e.target.value }))}
                  placeholder="e.g. Black"
                  className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Pattern</label>
                <input
                  type="text"
                  value={formData.pattern}
                  onChange={(e) => setFormData((p) => ({ ...p, pattern: e.target.value }))}
                  placeholder="e.g. Solid"
                  className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Material</label>
                <input
                  type="text"
                  value={formData.material}
                  onChange={(e) => setFormData((p) => ({ ...p, material: e.target.value }))}
                  placeholder="e.g. Cotton"
                  className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Season</label>
                <select
                  value={formData.season}
                  onChange={(e) => setFormData((p) => ({ ...p, season: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select season</option>
                  {SEASONS.map((s) => (
                    <option key={s} value={s}>{s.replace("_", " ").charAt(0) + s.replace("_", " ").slice(1).toLowerCase()}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Brand</label>
                <input
                  type="text"
                  value={formData.brand}
                  onChange={(e) => setFormData((p) => ({ ...p, brand: e.target.value }))}
                  placeholder="e.g. Nike"
                  className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData((p) => ({ ...p, notes: e.target.value }))}
                  placeholder="Any additional notes..."
                  rows={3}
                  className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-zinc-200 dark:border-zinc-800">
              <button
                onClick={() => router.push("/wardrobe")}
                className="px-4 py-2.5 rounded-lg border border-zinc-200 dark:border-zinc-700 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => saveMutation.mutate()}
                disabled={!isFormValid || saveMutation.isPending}
                className="px-6 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              >
                {saveMutation.isPending ? "Saving..." : "Save to Wardrobe"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
