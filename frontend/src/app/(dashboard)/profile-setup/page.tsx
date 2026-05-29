"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

export default function ProfileSetupPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [formData, setFormData] = useState({
    gender_preference: "",
    style_preference: "",
    location: "",
    favorite_colors: [] as string[],
    common_occasions: [] as string[],
  });
  const [colorsInput, setColorsInput] = useState("");
  const [occasionsInput, setOccasionsInput] = useState("");
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isLoading, isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const dataToSubmit = {
        ...formData,
        favorite_colors: colorsInput.split(",").map(s => s.trim()).filter(Boolean),
        common_occasions: occasionsInput.split(",").map(s => s.trim()).filter(Boolean),
      };
      
      await api.auth.updateProfile(dataToSubmit);
      
      window.location.href = "/dashboard";
    } catch (err: any) {
      setError(err.message || "Failed to save profile. Try again.");
      setIsSaving(false);
    }
  };

  if (isLoading || !isAuthenticated) return null;

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-[radial-gradient(circle,rgba(82,225,254,0.03)_0%,transparent_70%)] pointer-events-none" />

      <Card variant="translucent" className="w-full max-w-2xl p-8 md:p-12 z-10 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyber-cyan to-transparent opacity-50" />
        
        <div className="text-center mb-8">
          <div className="w-12 h-12 mx-auto rounded-xl bg-carbon flex items-center justify-center shadow-subtle-2 mb-4 border border-cyber-cyan/20">
            <span className="text-xl">✨</span>
          </div>
          <h2 className="text-2xl font-medium text-porcelain tracking-tight mb-2">Set up your profile</h2>
          <p className="text-cloudburst text-sm">Tell us about your style to get better AI recommendations.</p>
        </div>

        {error && <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-[11px] font-medium text-cloudburst mb-1.5 uppercase tracking-wider">Gender Preference</label>
              <select
                value={formData.gender_preference}
                onChange={e => setFormData({ ...formData, gender_preference: e.target.value })}
                className="w-full bg-inkwell border border-starlight/10 rounded-xl px-4 py-3 text-porcelain text-sm focus:outline-none focus:border-cyber-cyan/50 focus:ring-1 focus:ring-cyber-cyan/50 transition-colors"
              >
                <option value="">Select...</option>
                <option value="menswear">Menswear</option>
                <option value="womenswear">Womenswear</option>
                <option value="unisex">Unisex / Neutral</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-medium text-cloudburst mb-1.5 uppercase tracking-wider">Style Preference</label>
              <select
                value={formData.style_preference}
                onChange={e => setFormData({ ...formData, style_preference: e.target.value })}
                className="w-full bg-inkwell border border-starlight/10 rounded-xl px-4 py-3 text-porcelain text-sm focus:outline-none focus:border-cyber-cyan/50 focus:ring-1 focus:ring-cyber-cyan/50 transition-colors"
              >
                <option value="">Select...</option>
                <option value="minimalist">Minimalist</option>
                <option value="streetwear">Streetwear</option>
                <option value="classic">Classic / Preppy</option>
                <option value="vintage">Vintage</option>
                <option value="techwear">Techwear</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-cloudburst mb-1.5 uppercase tracking-wider">Location <span className="text-cyber-cyan/60 lowercase tracking-normal">(for weather)</span></label>
            <input
              type="text"
              placeholder="e.g. New York, London, Tokyo"
              value={formData.location}
              onChange={e => setFormData({ ...formData, location: e.target.value })}
              className="w-full bg-inkwell border border-starlight/10 rounded-xl px-4 py-3 text-porcelain text-sm focus:outline-none focus:border-cyber-cyan/50 focus:ring-1 focus:ring-cyber-cyan/50 transition-colors placeholder:text-cloudburst/30"
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium text-cloudburst mb-1.5 uppercase tracking-wider">Favorite Colors <span className="text-cloudburst/60 lowercase tracking-normal">(comma separated)</span></label>
            <input
              type="text"
              placeholder="e.g. Black, Navy, Olive"
              value={colorsInput}
              onChange={e => setColorsInput(e.target.value)}
              className="w-full bg-inkwell border border-starlight/10 rounded-xl px-4 py-3 text-porcelain text-sm focus:outline-none focus:border-cyber-cyan/50 focus:ring-1 focus:ring-cyber-cyan/50 transition-colors placeholder:text-cloudburst/30"
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium text-cloudburst mb-1.5 uppercase tracking-wider">Common Occasions <span className="text-cloudburst/60 lowercase tracking-normal">(comma separated)</span></label>
            <input
              type="text"
              placeholder="e.g. Office, Casual Outings, Gym"
              value={occasionsInput}
              onChange={e => setOccasionsInput(e.target.value)}
              className="w-full bg-inkwell border border-starlight/10 rounded-xl px-4 py-3 text-porcelain text-sm focus:outline-none focus:border-cyber-cyan/50 focus:ring-1 focus:ring-cyber-cyan/50 transition-colors placeholder:text-cloudburst/30"
            />
          </div>

          <div className="pt-8 flex justify-end">
            <Button type="submit" variant="filled" size="lg" disabled={isSaving} className="w-full sm:w-auto min-w-[200px]">
              {isSaving ? "Saving Profile..." : "Save and Continue"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
