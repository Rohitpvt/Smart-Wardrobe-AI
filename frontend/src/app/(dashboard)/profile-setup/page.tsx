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
      
      // Update profile endpoint call
      await api.auth.updateProfile(dataToSubmit);
      
      // Force reload to get updated user state and redirect
      window.location.href = "/dashboard";
    } catch (err: any) {
      setError(err.message || "Failed to save profile. Try again.");
      setIsSaving(false);
    }
  };

  if (isLoading || !isAuthenticated) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 relative">
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,rgba(82,225,254,0.05)_0%,transparent_50%)] pointer-events-none" />

      <Card variant="translucent" className="w-full max-w-2xl p-8 z-10">
        <h2 className="text-2xl font-medium text-porcelain mb-2">Set up your profile</h2>
        <p className="text-cloudburst text-sm mb-8">Tell us about your style to get better AI recommendations.</p>

        {error && <div className="mb-4 text-red-400 text-sm">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-[13px] font-medium text-cloudburst mb-1.5 uppercase tracking-wider">Gender Preference</label>
              <select
                value={formData.gender_preference}
                onChange={e => setFormData({ ...formData, gender_preference: e.target.value })}
                className="w-full bg-inkwell border border-starlight/10 rounded-[8px] px-4 py-2.5 text-porcelain text-sm focus:outline-none focus:border-cyber-cyan/50"
              >
                <option value="">Select...</option>
                <option value="menswear">Menswear</option>
                <option value="womenswear">Womenswear</option>
                <option value="unisex">Unisex / Neutral</option>
              </select>
            </div>
            <div>
              <label className="block text-[13px] font-medium text-cloudburst mb-1.5 uppercase tracking-wider">Style Preference</label>
              <select
                value={formData.style_preference}
                onChange={e => setFormData({ ...formData, style_preference: e.target.value })}
                className="w-full bg-inkwell border border-starlight/10 rounded-[8px] px-4 py-2.5 text-porcelain text-sm focus:outline-none focus:border-cyber-cyan/50"
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
            <label className="block text-[13px] font-medium text-cloudburst mb-1.5 uppercase tracking-wider">Location (for weather)</label>
            <input
              type="text"
              placeholder="e.g. New York, London, Tokyo"
              value={formData.location}
              onChange={e => setFormData({ ...formData, location: e.target.value })}
              className="w-full bg-inkwell border border-starlight/10 rounded-[8px] px-4 py-2.5 text-porcelain text-sm focus:outline-none focus:border-cyber-cyan/50"
            />
          </div>

          <div>
            <label className="block text-[13px] font-medium text-cloudburst mb-1.5 uppercase tracking-wider">Favorite Colors (comma separated)</label>
            <input
              type="text"
              placeholder="e.g. Black, Navy, Olive"
              value={colorsInput}
              onChange={e => setColorsInput(e.target.value)}
              className="w-full bg-inkwell border border-starlight/10 rounded-[8px] px-4 py-2.5 text-porcelain text-sm focus:outline-none focus:border-cyber-cyan/50"
            />
          </div>

          <div>
            <label className="block text-[13px] font-medium text-cloudburst mb-1.5 uppercase tracking-wider">Common Occasions (comma separated)</label>
            <input
              type="text"
              placeholder="e.g. Office, Casual Outings, Gym"
              value={occasionsInput}
              onChange={e => setOccasionsInput(e.target.value)}
              className="w-full bg-inkwell border border-starlight/10 rounded-[8px] px-4 py-2.5 text-porcelain text-sm focus:outline-none focus:border-cyber-cyan/50"
            />
          </div>

          <div className="pt-4 border-t border-starlight/10 flex justify-end">
            <Button type="submit" variant="filled" disabled={isSaving}>
              {isSaving ? "Saving..." : "Save and Continue"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
