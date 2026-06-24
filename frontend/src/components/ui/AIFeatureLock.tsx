"use client";

import { useState, useEffect } from "react";
import { m, AnimatePresence } from "framer-motion";
import { Lock, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/axios";

interface AIFeatureLockProps {
  children: React.ReactNode;
}

export default function AIFeatureLock({ children }: AIFeatureLockProps) {
  const router = useRouter();
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAccess = async () => {
      try {
        const { data } = await api.get("/user-ai-keys/status");
        if (data?.gemini?.connected && !data.gemini.last_error) {
          setHasAccess(true);
        } else {
          setHasAccess(false);
        }
      } catch (e) {
        setHasAccess(false);
      } finally {
        setLoading(false);
      }
    };
    checkAccess();
  }, []);

  if (loading) {
    return (
      <div className="w-full h-64 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-brand-purple border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (hasAccess) {
    return <>{children}</>;
  }

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-white/10 bg-surface-1/50 p-8 text-center flex flex-col items-center justify-center min-h-[400px]">
      <div className="w-16 h-16 bg-surface-2 rounded-2xl flex items-center justify-center mb-6 shadow-inner border border-white/5">
        <Lock className="w-8 h-8 text-slate-400" />
      </div>
      
      <h2 className="text-2xl font-bold text-white mb-3">Gemini API Key Required</h2>
      <p className="text-slate-400 max-w-md mb-8 leading-relaxed">
        This feature uses Gemini AI. Add your Gemini API key to continue.
      </p>

      <div className="flex items-center gap-4">
        <button
          onClick={() => router.push("/settings/ai-access")}
          className="px-6 py-3 bg-brand-purple hover:bg-brand-purple-light text-white font-medium rounded-xl transition-all flex items-center gap-2 group"
        >
          Add Gemini Key
          <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
        <button
          onClick={() => router.back()}
          className="px-6 py-3 bg-surface-2 hover:bg-surface-3 text-slate-300 font-medium rounded-xl transition-all"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
