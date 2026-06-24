"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/axios";
import { toast } from "sonner";
import { KeyRound, CheckCircle2, XCircle, AlertTriangle, ShieldCheck, Loader2 } from "lucide-react";
import { m } from "framer-motion";
import { AIAccessSkeleton } from "@/components/ui/skeleton-loaders";

interface KeyStatus {
  connected: boolean;
  key_fingerprint: string | null;
  last_verified_at: string | null;
  last_error: string | null;
}

export default function AIAccessSettingsPage() {
  const [status, setStatus] = useState<KeyStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [apiKey, setApiKey] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchStatus = async () => {
    try {
      const { data } = await api.get("/user-ai-keys/status");
      setStatus(data.gemini);
    } catch (e) {
      console.error("Failed to fetch key status");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKey || apiKey.length < 10) {
      toast.error("Please enter a valid API key");
      return;
    }
    
    setIsSubmitting(true);
    try {
      await api.post("/user-ai-keys/gemini", { api_key: apiKey });
      toast.success("Gemini key saved and verified successfully!");
      setApiKey("");
      await fetchStatus();
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Failed to verify or save key.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTest = async () => {
    setIsSubmitting(true);
    try {
      await api.post("/user-ai-keys/gemini/test");
      toast.success("Connection tested successfully!");
      await fetchStatus();
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Key test failed.");
      await fetchStatus();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemove = async () => {
    if (!confirm("Are you sure you want to remove your Gemini API key? AI features will be disabled until you add a new one.")) return;
    
    setIsSubmitting(true);
    try {
      await api.delete("/user-ai-keys/gemini");
      toast.success("Gemini key removed.");
      await fetchStatus();
    } catch (error) {
      toast.error("Failed to remove key.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <AIAccessSkeleton />;
  }

  return (
    <div className="max-w-4xl mx-auto pb-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">AI Provider Access</h1>
        <p className="text-slate-400">Manage your connected AI providers to power Smart Wardrobe AI.</p>
      </div>

      <div className="grid gap-6">
        
        {/* Gemini Provider Card */}
        <div className="bg-surface-1 border border-white/5 rounded-2xl p-6">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-surface-2 rounded-xl border border-white/10 flex items-center justify-center">
                <ShieldCheck className="w-6 h-6 text-brand-purple" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Google Gemini</h2>
                <div className="flex items-center gap-2 mt-1">
                  {status?.connected && !status.last_error ? (
                    <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                      <CheckCircle2 className="w-3 h-3" /> Connected
                    </span>
                  ) : status?.connected && status.last_error ? (
                    <span className="flex items-center gap-1.5 text-xs font-medium text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/20">
                      <AlertTriangle className="w-3 h-3" /> Key Invalid
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5 text-xs font-medium text-slate-400 bg-surface-2 px-2 py-0.5 rounded-full border border-white/5">
                      <XCircle className="w-3 h-3" /> Not Connected
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {status?.connected ? (
            <div className="space-y-4">
              <div className="p-4 bg-surface-2 rounded-xl border border-white/5">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-slate-500 mb-1 font-label-md uppercase">Key Fingerprint</p>
                    <p className="text-sm font-mono text-slate-300">{status.key_fingerprint}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 mb-1 font-label-md uppercase">Last Verified</p>
                    <p className="text-sm text-slate-300">
                      {status.last_verified_at ? new Date(status.last_verified_at).toLocaleString() : 'Never'}
                    </p>
                  </div>
                </div>
                {status.last_error && (
                  <div className="mt-4 p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg flex gap-3">
                    <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-rose-400 mb-1">Key Validation Failed</p>
                      <p className="text-xs text-rose-400/80">{status.last_error}</p>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={handleTest}
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-surface-2 hover:bg-surface-3 text-white text-sm font-medium rounded-lg transition-colors border border-white/5 disabled:opacity-50 flex items-center gap-2"
                >
                  {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  Test Connection
                </button>
                <button
                  onClick={handleRemove}
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-sm font-medium rounded-lg transition-colors border border-rose-500/20 disabled:opacity-50"
                >
                  Remove Key
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label htmlFor="apiKey" className="block text-sm font-medium text-slate-300 mb-2">
                  Gemini API Key
                </label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                  <input
                    id="apiKey"
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="AIzaSy..."
                    className="w-full pl-10 pr-4 py-2.5 bg-surface-2 border border-white/10 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-brand-purple/50 focus:ring-1 focus:ring-brand-purple/50 transition-all"
                  />
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  Your key is securely encrypted before being stored. It will only be used to process your AI requests.
                </p>
              </div>
              
              <button
                type="submit"
                disabled={isSubmitting || !apiKey}
                className="px-6 py-2.5 bg-brand-purple hover:bg-brand-purple-light text-white text-sm font-medium rounded-xl transition-all disabled:opacity-50 disabled:hover:bg-brand-purple flex items-center gap-2"
              >
                {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                Save & Verify
              </button>
            </form>
          )}
        </div>

        {/* Instructions Card */}
        <div className="bg-surface-1/50 border border-white/5 rounded-2xl p-6">
          <h3 className="text-lg font-bold text-white mb-4">How to get your Gemini API key</h3>
          <ol className="list-decimal list-inside space-y-3 text-sm text-slate-300">
            <li>Go to <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="text-brand-purple hover:underline font-medium">Google AI Studio</a>.</li>
            <li>Sign in with your Google account.</li>
            <li>Open the API key section.</li>
            <li>Click <span className="text-white font-medium bg-surface-2 px-1.5 py-0.5 rounded text-xs">Create API key</span>.</li>
            <li>Copy the generated key.</li>
            <li>Paste it into Smart Wardrobe AI above.</li>
            <li>Click <span className="text-white font-medium bg-surface-2 px-1.5 py-0.5 rounded text-xs">Save & Verify</span>.</li>
          </ol>
          <div className="mt-6 p-4 bg-brand-purple/10 border border-brand-purple/20 rounded-xl">
            <p className="text-xs text-brand-purple/90 font-medium">
              Warning: Keep your API key private. Do not share it publicly. You can delete it from Smart Wardrobe AI anytime.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
