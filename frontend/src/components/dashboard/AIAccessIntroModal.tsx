"use client";

import { useState, useEffect } from "react";
import { m, AnimatePresence } from "framer-motion";
import { KeyRound, X, ChevronRight } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import { useRouter } from "next/navigation";

export default function AIAccessIntroModal() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const { data: user } = useQuery({
    queryKey: ["validate-session"],
    queryFn: async () => {
      const response = await api.get("/users/me");
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    // Only show if user is logged in and hasn't dismissed it
    if (user && user.ai_access_intro_dismissed === false) {
      setIsOpen(true);
    }
  }, [user]);

  const handleDismiss = async () => {
    setLoading(true);
    try {
      await api.patch("/users/profile", {
        ai_access_intro_dismissed: true,
      });
      queryClient.invalidateQueries({ queryKey: ["validate-session"] });
    } catch (e) {
      console.error("Failed to update preferences", e);
    } finally {
      setIsOpen(false);
      setLoading(false);
    }
  };

  const handleAddKey = () => {
    handleDismiss();
    router.push("/settings/ai-access");
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
          />
          <m.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-md bg-surface-1 border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="relative p-6 text-center border-b border-white/5 bg-gradient-to-br from-brand-purple/10 to-transparent">
              <div className="mx-auto w-12 h-12 bg-brand-purple/20 rounded-xl flex items-center justify-center mb-4">
                <KeyRound className="w-6 h-6 text-brand-purple" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">AI Access Setup</h2>
            </div>

            {/* Content */}
            <div className="p-6">
              <p className="text-sm text-slate-300 leading-relaxed mb-6">
                Smart Wardrobe AI uses Gemini AI to generate outfits, analyze clothing, and power your AI Stylist.
                <br /><br />
                To use AI features, connect your Gemini API key. Your key will be encrypted and used only for your own AI requests.
              </p>

              {/* Actions */}
              <div className="space-y-3">
                <button
                  onClick={handleAddKey}
                  disabled={loading}
                  className="w-full py-3 px-4 bg-brand-purple hover:bg-brand-purple-light text-white font-medium rounded-xl transition-all flex items-center justify-center gap-2 group"
                >
                  Add Gemini Key
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>

                <button
                  onClick={() => {
                    handleDismiss();
                    window.open("https://aistudio.google.com/app/apikey", "_blank");
                  }}
                  disabled={loading}
                  className="w-full py-3 px-4 bg-surface-2 hover:bg-surface-3 text-white font-medium rounded-xl transition-all"
                >
                  Learn how to get a key
                </button>
                
                <button
                  onClick={handleDismiss}
                  disabled={loading}
                  className="w-full py-3 px-4 text-slate-400 hover:text-white text-sm font-medium transition-colors"
                >
                  Maybe later
                </button>
              </div>
            </div>
          </m.div>
        </div>
      )}
    </AnimatePresence>
  );
}
