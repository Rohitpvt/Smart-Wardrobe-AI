"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import { ArrowLeft, Key, Activity, AlertTriangle, CheckCircle2, XCircle, Clock, ExternalLink } from "lucide-react";
import Link from "next/link";
import { format, formatDistanceToNow } from "date-fns";
import { AIUsageSkeleton } from "@/components/ui/skeleton-loaders";

interface GeminiKeyInfo {
  connected: boolean;
  key_fingerprint: string | null;
  last_verified_at: string | null;
  last_used_at: string | null;
  last_error: string | null;
  is_active: boolean;
}

interface ActivityEvent {
  id: string;
  time: string;
  feature: string;
  credential_source: string;
  status: string;
  tokens: number | null;
  latency_ms: number | null;
  error: string | null;
}

interface ByokActivity {
  ai_access_mode: string;
  gemini_key: GeminiKeyInfo;
  activity: ActivityEvent[];
}

function getKeyState(key: GeminiKeyInfo): "connected" | "not_connected" | "invalid" | "quota" {
  if (!key.connected && !key.key_fingerprint) return "not_connected";
  if (!key.is_active && key.last_error) {
    const err = key.last_error.toLowerCase();
    if (err.includes("quota") || err.includes("rate") || err.includes("429") || err.includes("resource_exhausted")) {
      return "quota";
    }
    return "invalid";
  }
  if (key.connected) return "connected";
  return "not_connected";
}

function formatCredentialSource(src: string): string {
  if (src === "user_gemini") return "User Gemini Key";
  if (src?.startsWith("platform_")) return "Platform Fallback";
  return "Not available";
}

function formatFeatureName(name: string): string {
  return name
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function getStatusColor(status: string): string {
  if (status.includes("success")) return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400";
  if (status === "started") return "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400";
  if (status.includes("quota")) return "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400";
  return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
}

function formatStatusLabel(status: string): string {
  const map: Record<string, string> = {
    "success": "Success",
    "user_key_success": "Success",
    "fallback_success": "Fallback Success",
    "user_ai_quota_exceeded": "Quota Exceeded",
    "user_ai_key_invalid": "Key Invalid",
    "gemini_temporarily_unavailable": "Gemini Busy",
    "started": "In Progress",
    "failed": "Failed",
    "user_key_failed": "Key Failed",
    "fallback_failed": "Fallback Failed",
  };
  return map[status] || status.replace(/_/g, " ");
}

export default function AiActivityPage() {
  const { data, isLoading, isError } = useQuery<ByokActivity>({
    queryKey: ["byok-activity"],
    queryFn: async () => {
      const res = await api.get("/ai-usage/byok-activity");
      return res.data;
    },
  });

  if (isLoading) {
    return <AIUsageSkeleton />;
  }

  if (isError || !data) {
    return (
      <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-xl flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 mt-0.5" />
          <p>Failed to load AI activity. Please try again later.</p>
        </div>
      </div>
    );
  }

  const keyState = getKeyState(data.gemini_key);

  const stateConfig = {
    connected: {
      badge: "Connected",
      badgeClass: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-400",
      icon: CheckCircle2,
      iconClass: "text-emerald-500",
      borderClass: "border-emerald-500/20",
      text: "AI features are using your own Gemini API key. Your Gemini quota is managed by Google AI Studio, not by Smart Wardrobe AI.",
      buttonText: "Manage Gemini Key",
    },
    not_connected: {
      badge: "Not Connected",
      badgeClass: "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400",
      icon: XCircle,
      iconClass: "text-neutral-400",
      borderClass: "border-neutral-500/20",
      text: "Add your Gemini API key to unlock AI Stylist, outfit recommendations, and clothing analysis.",
      buttonText: "Add Gemini Key",
    },
    invalid: {
      badge: "Needs Attention",
      badgeClass: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-400",
      icon: XCircle,
      iconClass: "text-red-500",
      borderClass: "border-red-500/20",
      text: "Your Gemini API key is invalid or no longer has permission. Please replace it to continue using AI features.",
      buttonText: "Replace Gemini Key",
    },
    quota: {
      badge: "Gemini quota reached",
      badgeClass: "bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-400",
      icon: AlertTriangle,
      iconClass: "text-orange-500",
      borderClass: "border-orange-500/20",
      text: "Your Gemini API key reached its Google quota or rate limit. Please wait, check Google AI Studio, or add another key.",
      buttonText: "Manage Gemini Key",
    },
  };

  const cfg = stateConfig[keyState];
  const StateIcon = cfg.icon;

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
      {/* Header */}
      <div>
        <Link
          href="/settings"
          className="inline-flex items-center text-sm font-medium text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Settings
        </Link>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">
          AI Access &amp; Activity
        </h1>
        <p className="text-neutral-500 dark:text-neutral-400 mt-2">
          Monitor your Gemini key connection, AI activity, and recent errors.
        </p>
      </div>

      {/* Info Banner */}
      <div className="bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-200 dark:border-indigo-800/30 rounded-xl px-5 py-4">
        <p className="text-sm text-indigo-700 dark:text-indigo-300 leading-relaxed">
          AI features are powered by your connected Gemini API key. Your actual Gemini quota is managed by Google AI Studio.
          Smart Wardrobe AI only shows local activity and key health.
        </p>
      </div>

      {/* Gemini Key Status Card */}
      <div className={`bg-white dark:bg-neutral-900 border ${cfg.borderClass} rounded-2xl p-6 sm:p-8 shadow-sm`}>
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
              <Key className="w-6 h-6 text-neutral-600 dark:text-neutral-300" />
            </div>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
                  Gemini API Key
                </h2>
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${cfg.badgeClass}`}>
                  <StateIcon className={`w-3.5 h-3.5 ${cfg.iconClass}`} />
                  {cfg.badge}
                </span>
              </div>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 max-w-lg leading-relaxed">
                {cfg.text}
              </p>

              {/* Key Details (only when connected or has data) */}
              {data.gemini_key.key_fingerprint && (
                <div className="mt-4 space-y-1.5 text-sm">
                  <div className="flex items-center gap-2 text-neutral-600 dark:text-neutral-300">
                    <Key className="w-3.5 h-3.5 text-neutral-400" />
                    <span className="font-mono">{data.gemini_key.key_fingerprint}</span>
                  </div>
                  {data.gemini_key.last_verified_at && (
                    <div className="flex items-center gap-2 text-neutral-500 dark:text-neutral-400">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                      Last verified: {formatDistanceToNow(new Date(data.gemini_key.last_verified_at), { addSuffix: true })}
                    </div>
                  )}
                  {data.gemini_key.last_used_at && (
                    <div className="flex items-center gap-2 text-neutral-500 dark:text-neutral-400">
                      <Clock className="w-3.5 h-3.5 text-blue-500" />
                      Last used: {formatDistanceToNow(new Date(data.gemini_key.last_used_at), { addSuffix: true })}
                    </div>
                  )}
                  {data.gemini_key.last_error && (
                    <div className="flex items-center gap-2 text-red-500 dark:text-red-400 text-xs">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      {data.gemini_key.last_error.slice(0, 120)}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Action Button */}
          <Link
            href="/settings/ai-access"
            className="flex-shrink-0 inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-xl transition-colors self-start"
          >
            {cfg.buttonText}
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Recent Activity Table */}
      <div>
        <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-1 flex items-center gap-2">
          <Activity className="w-5 h-5 text-indigo-500" />
          Recent Activity
        </h3>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-4">
          Local AI activity log. This does not reflect your full Google AI Studio usage.
        </p>

        {data.activity.length === 0 ? (
          <div className="text-center py-12 bg-neutral-50 dark:bg-neutral-900/50 rounded-2xl border border-neutral-100 dark:border-neutral-800 border-dashed">
            <p className="text-neutral-500 dark:text-neutral-400">No AI activity recorded yet.</p>
          </div>
        ) : (
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-neutral-50 dark:bg-neutral-800/50 text-neutral-500 dark:text-neutral-400 text-xs uppercase">
                  <tr>
                    <th className="px-4 py-3 font-medium">Time</th>
                    <th className="px-4 py-3 font-medium">Feature</th>
                    <th className="px-4 py-3 font-medium">Credential</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Tokens</th>
                    <th className="px-4 py-3 font-medium hidden sm:table-cell">Latency</th>
                    <th className="px-4 py-3 font-medium hidden md:table-cell">Error</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                  {data.activity.map((event) => (
                    <tr key={event.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors">
                      <td className="px-4 py-3 text-neutral-900 dark:text-white whitespace-nowrap">
                        {format(new Date(event.time), "MMM d, h:mm a")}
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-medium text-neutral-900 dark:text-white">
                          {formatFeatureName(event.feature)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-medium ${
                          event.credential_source === "user_gemini"
                            ? "text-emerald-600 dark:text-emerald-400"
                            : event.credential_source?.startsWith("platform_")
                            ? "text-amber-600 dark:text-amber-400"
                            : "text-neutral-400"
                        }`}>
                          {formatCredentialSource(event.credential_source)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(event.status)}`}>
                          {formatStatusLabel(event.status)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-neutral-600 dark:text-neutral-300">
                        {event.tokens ? event.tokens.toLocaleString() : <span className="text-neutral-400 italic text-xs">Not reported</span>}
                      </td>
                      <td className="px-4 py-3 text-neutral-600 dark:text-neutral-300 hidden sm:table-cell">
                        {event.latency_ms ? `${(event.latency_ms / 1000).toFixed(1)}s` : <span className="text-neutral-400">—</span>}
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        {event.error ? (
                          <span className="text-red-500 dark:text-red-400 text-xs">{event.error}</span>
                        ) : (
                          <span className="text-neutral-400">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
