"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import { ShieldAlert, Zap, Clock, TrendingUp, AlertTriangle, Users, Filter, BarChart2 } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";

export default function AdminAiUsagePage() {
  const [range, setRange] = useState<"today" | "7d" | "30d" | "all">("30d");
  const [usersPage, setUsersPage] = useState(1);
  const [eventsPage, setEventsPage] = useState(1);

  // Queries
  const { data: summary, isLoading: isLoadingSummary, isError: isErrorSummary, error } = useQuery({
    queryKey: ["admin-ai-summary"],
    queryFn: async () => {
      const res = await api.get("/admin/ai-usage/summary");
      return res.data;
    },
    retry: false
  });

  const { data: users, isLoading: isLoadingUsers } = useQuery({
    queryKey: ["admin-ai-users", range],
    queryFn: async () => {
      const res = await api.get(`/admin/ai-usage/users?range=${range}&limit=50`);
      return res.data;
    },
    retry: false
  });

  const { data: features, isLoading: isLoadingFeatures } = useQuery({
    queryKey: ["admin-ai-features"],
    queryFn: async () => {
      const res = await api.get("/admin/ai-usage/features");
      return res.data;
    },
    retry: false
  });

  const { data: plans, isLoading: isLoadingPlans } = useQuery({
    queryKey: ["admin-ai-plans"],
    queryFn: async () => {
      const res = await api.get("/admin/ai-usage/plans");
      return res.data;
    },
    retry: false
  });

  const { data: events, isLoading: isLoadingEvents } = useQuery({
    queryKey: ["admin-ai-events", eventsPage],
    queryFn: async () => {
      const res = await api.get(`/admin/ai-usage/events?page=${eventsPage}&limit=20`);
      return res.data;
    },
    retry: false
  });

  // Access Denied State
  if (error && (error as any)?.response?.status === 403) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-950 p-4">
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-8 max-w-md w-full text-center shadow-xl">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShieldAlert className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2">Access Denied</h1>
          <p className="text-neutral-500 dark:text-neutral-400 mb-8">
            You do not have permission to view the Admin AI Usage dashboard. This area is restricted to administrators.
          </p>
          <Link 
            href="/dashboard"
            className="inline-flex items-center justify-center w-full bg-black dark:bg-white text-white dark:text-black font-medium py-2.5 px-4 rounded-xl hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors"
          >
            Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  if (isLoadingSummary) {
    return <div className="p-8 animate-pulse text-center text-neutral-500">Loading admin dashboard...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900 dark:text-white flex items-center gap-2">
          <ShieldAlert className="w-6 h-6 text-indigo-500" />
          Admin AI Usage Monitor
        </h1>
        <p className="text-neutral-500 dark:text-neutral-400 mt-2">
          Global platform AI consumption, fallback patterns, and estimated costs.
        </p>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-5">
            <div className="flex items-center text-neutral-500 mb-2">
              <Zap className="w-4 h-4 mr-2" />
              <span className="text-sm font-medium">Requests Today</span>
            </div>
            <div className="text-2xl font-bold text-neutral-900 dark:text-white">{summary.total_requests_today}</div>
          </div>
          
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-5">
            <div className="flex items-center text-amber-500 mb-2">
              <AlertTriangle className="w-4 h-4 mr-2" />
              <span className="text-sm font-medium">Quota Blocked</span>
            </div>
            <div className="text-2xl font-bold text-neutral-900 dark:text-white">{summary.quota_blocked_count}</div>
          </div>

          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-5">
            <div className="flex items-center text-indigo-500 mb-2">
              <TrendingUp className="w-4 h-4 mr-2" />
              <span className="text-sm font-medium">Total Tokens</span>
            </div>
            <div className="text-2xl font-bold text-neutral-900 dark:text-white">
              {summary.total_reported_tokens ? summary.total_reported_tokens.toLocaleString() : "Not reported"}
            </div>
          </div>

          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-5">
            <div className="flex items-center text-emerald-500 mb-2">
              <BarChart2 className="w-4 h-4 mr-2" />
              <span className="text-sm font-medium">Est. Cost</span>
            </div>
            <div className="text-2xl font-bold text-neutral-900 dark:text-white">
              {summary.estimated_cost !== null ? `$${summary.estimated_cost.toFixed(4)}` : "Not available"}
            </div>
          </div>
        </div>
      )}

      {/* Feature Breakdown */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-5 border-b border-neutral-200 dark:border-neutral-800">
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">Feature Analytics</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-neutral-50 dark:bg-neutral-800/50 text-neutral-500 dark:text-neutral-400 text-xs uppercase">
              <tr>
                <th className="px-5 py-3 font-medium">Feature</th>
                <th className="px-5 py-3 font-medium">Requests</th>
                <th className="px-5 py-3 font-medium">Success Rate</th>
                <th className="px-5 py-3 font-medium">Tokens</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
              {features?.map((f: any) => (
                <tr key={f.feature_name} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50">
                  <td className="px-5 py-4 font-medium text-neutral-900 dark:text-white">{f.feature_name}</td>
                  <td className="px-5 py-4 text-neutral-600 dark:text-neutral-300">{f.total_requests}</td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${f.success_rate > 90 ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'}`}>
                      {f.success_rate.toFixed(1)}%
                    </span>
                  </td>
                  <td className="px-5 py-4 text-neutral-600 dark:text-neutral-300">
                    {f.total_reported_tokens ? f.total_reported_tokens.toLocaleString() : <span className="text-neutral-400 italic">Not reported</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Usage by Plan */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-5 border-b border-neutral-200 dark:border-neutral-800">
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">Usage by Plan</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-neutral-50 dark:bg-neutral-800/50 text-neutral-500 dark:text-neutral-400 text-xs uppercase">
              <tr>
                <th className="px-5 py-3 font-medium">Plan</th>
                <th className="px-5 py-3 font-medium">Users</th>
                <th className="px-5 py-3 font-medium">Requests</th>
                <th className="px-5 py-3 font-medium">Blocked</th>
                <th className="px-5 py-3 font-medium">Avg/User</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
              {plans?.map((p: any) => (
                <tr key={p.plan_name} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50">
                  <td className="px-5 py-4 font-medium text-neutral-900 dark:text-white capitalize">{p.plan_name}</td>
                  <td className="px-5 py-4 text-neutral-600 dark:text-neutral-300">{p.total_users}</td>
                  <td className="px-5 py-4 text-neutral-600 dark:text-neutral-300">{p.total_requests}</td>
                  <td className="px-5 py-4">
                    {p.quota_blocked_count > 0 ? (
                      <span className="text-amber-600 dark:text-amber-400 font-medium">{p.quota_blocked_count}</span>
                    ) : (
                      <span className="text-neutral-400">0</span>
                    )}
                  </td>
                  <td className="px-5 py-4 text-neutral-600 dark:text-neutral-300">{p.average_requests_per_user.toFixed(1)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Top Users */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-5 border-b border-neutral-200 dark:border-neutral-800 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-neutral-400" />
            Top Users by AI Activity
          </h2>
          <div className="flex bg-neutral-100 dark:bg-neutral-800 p-1 rounded-lg">
            {["today", "7d", "30d", "all"].map((r) => (
              <button
                key={r}
                onClick={() => setRange(r as any)}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${range === r ? "bg-white dark:bg-neutral-700 shadow text-neutral-900 dark:text-white" : "text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"}`}
              >
                {r === '7d' ? '7 Days' : r === '30d' ? '30 Days' : r.charAt(0).toUpperCase() + r.slice(1)}
              </button>
            ))}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-neutral-50 dark:bg-neutral-800/50 text-neutral-500 dark:text-neutral-400 text-xs uppercase">
              <tr>
                <th className="px-5 py-3 font-medium">User</th>
                <th className="px-5 py-3 font-medium">Plan</th>
                <th className="px-5 py-3 font-medium">Requests</th>
                <th className="px-5 py-3 font-medium">Blocked</th>
                <th className="px-5 py-3 font-medium">Est. Cost</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
              {users?.map((u: any) => (
                <tr key={u.user_id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50">
                  <td className="px-5 py-4 font-medium text-neutral-900 dark:text-white truncate max-w-[200px]">{u.email}</td>
                  <td className="px-5 py-4">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-300 capitalize">
                      {u.effective_plan}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-neutral-600 dark:text-neutral-300">{u.total_requests}</td>
                  <td className="px-5 py-4">
                    {u.blocked_requests > 0 ? (
                      <span className="text-amber-600 dark:text-amber-400 font-medium">{u.blocked_requests}</span>
                    ) : (
                      <span className="text-neutral-400">0</span>
                    )}
                  </td>
                  <td className="px-5 py-4 text-neutral-600 dark:text-neutral-300">
                    {u.estimated_cost !== null ? `$${u.estimated_cost.toFixed(4)}` : <span className="text-neutral-400 italic">Not available</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Events Log */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-5 border-b border-neutral-200 dark:border-neutral-800 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-neutral-400" />
            Raw Event Logs
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-neutral-50 dark:bg-neutral-800/50 text-neutral-500 dark:text-neutral-400 text-xs uppercase">
              <tr>
                <th className="px-5 py-3 font-medium">Time</th>
                <th className="px-5 py-3 font-medium">User</th>
                <th className="px-5 py-3 font-medium">Feature</th>
                <th className="px-5 py-3 font-medium">Provider</th>
                <th className="px-5 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
              {events?.items?.map((evt: any) => (
                <tr key={evt.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50">
                  <td className="px-5 py-3 text-neutral-600 dark:text-neutral-400 whitespace-nowrap">
                    {format(new Date(evt.created_at), "MMM d, HH:mm:ss")}
                  </td>
                  <td className="px-5 py-3 text-neutral-900 dark:text-white truncate max-w-[150px]">{evt.user_email}</td>
                  <td className="px-5 py-3 font-medium text-neutral-800 dark:text-neutral-200">{evt.feature_name}</td>
                  <td className="px-5 py-3 text-neutral-500 capitalize">{evt.provider}</td>
                  <td className="px-5 py-3">
                    <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${evt.status.includes('success') ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400' : evt.status === 'started' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'}`}>
                      {evt.status.replace('_', ' ')}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t border-neutral-200 dark:border-neutral-800 flex justify-between items-center text-sm text-neutral-500">
          <span>Showing page {events?.page} of {events?.pages}</span>
          <div className="flex gap-2">
            <button 
              disabled={eventsPage <= 1}
              onClick={() => setEventsPage(p => p - 1)}
              className="px-3 py-1 bg-neutral-100 dark:bg-neutral-800 rounded disabled:opacity-50"
            >
              Prev
            </button>
            <button 
              disabled={eventsPage >= (events?.pages || 1)}
              onClick={() => setEventsPage(p => p + 1)}
              className="px-3 py-1 bg-neutral-100 dark:bg-neutral-800 rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
