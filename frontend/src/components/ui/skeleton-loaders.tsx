"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

/* ─────────────────────────────────────────────
   Base Building Blocks
   ───────────────────────────────────────────── */

/** Glass-panel style skeleton wrapper matching GlassPanel design. */
function SkeletonPanel({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-2xl bg-surface-1/70 backdrop-blur-xl border border-white/[0.06] relative overflow-hidden",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

/* ─────────────────────────────────────────────
   Page Header
   ───────────────────────────────────────────── */

export function PageHeaderSkeleton() {
  return (
    <SkeletonPanel className="p-8 md:p-10">
      <Skeleton className="h-8 w-56 mb-3 rounded-lg" />
      <Skeleton className="h-4 w-80 rounded" />
    </SkeletonPanel>
  );
}

/* ─────────────────────────────────────────────
   Stats / KPI Grid
   ───────────────────────────────────────────── */

export function StatsGridSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonPanel key={i} className="p-5 md:p-6">
          <div className="flex items-center gap-3 mb-4">
            <Skeleton className="w-10 h-10 rounded-xl" />
            <Skeleton className="h-3 w-16 rounded" />
          </div>
          <Skeleton className="h-7 w-20 rounded-lg mb-2" />
          <Skeleton className="h-3 w-24 rounded" />
        </SkeletonPanel>
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────
   Generic Card
   ───────────────────────────────────────────── */

export function CardSkeleton({ className }: { className?: string }) {
  return (
    <SkeletonPanel className={cn("p-6", className)}>
      <div className="flex items-center gap-3 mb-5">
        <Skeleton className="w-10 h-10 rounded-xl" />
        <div className="flex-1">
          <Skeleton className="h-4 w-32 rounded mb-2" />
          <Skeleton className="h-3 w-48 rounded" />
        </div>
      </div>
      <div className="space-y-3">
        <Skeleton className="h-3 w-full rounded" />
        <Skeleton className="h-3 w-5/6 rounded" />
        <Skeleton className="h-3 w-4/6 rounded" />
      </div>
    </SkeletonPanel>
  );
}

/* ─────────────────────────────────────────────
   Chart Skeleton
   ───────────────────────────────────────────── */

export function ChartSkeleton() {
  return (
    <SkeletonPanel className="p-6 h-80">
      <Skeleton className="h-4 w-36 rounded mb-6" />
      <div className="flex items-end gap-2 h-52">
        {[40, 65, 50, 80, 55, 70, 45, 60, 75, 50, 85, 55].map((h, i) => (
          <Skeleton
            key={i}
            className="flex-1 rounded-t-md"
            style={{ height: `${h}%` }}
          />
        ))}
      </div>
    </SkeletonPanel>
  );
}

/* ─────────────────────────────────────────────
   Wardrobe Grid
   ───────────────────────────────────────────── */

function WardrobeItemSkeleton() {
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-surface-1/70 overflow-hidden break-inside-avoid">
      <Skeleton className="aspect-[3/4] w-full rounded-none" />
      <div className="p-4 space-y-2.5">
        <Skeleton className="h-4 w-3/4 rounded" />
        <Skeleton className="h-3 w-1/2 rounded" />
        <div className="flex gap-2 pt-1">
          <Skeleton className="h-5 w-14 rounded-full" />
          <Skeleton className="h-5 w-10 rounded-full" />
        </div>
      </div>
    </div>
  );
}

export function WardrobeGridSkeleton({ count = 10 }: { count?: number }) {
  return (
    <div className="columns-2 md:columns-3 lg:columns-4 xl:columns-5 gap-6 space-y-6">
      {Array.from({ length: count }).map((_, i) => (
        <WardrobeItemSkeleton key={i} />
      ))}
    </div>
  );
}

/** Search bar + filters skeleton row for wardrobe. */
export function WardrobeFilterSkeleton() {
  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <Skeleton className="h-11 flex-1 rounded-xl" />
      <div className="flex gap-3">
        <Skeleton className="h-11 w-28 rounded-xl" />
        <Skeleton className="h-11 w-28 rounded-xl" />
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Table
   ───────────────────────────────────────────── */

export function TableSkeleton({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <SkeletonPanel className="overflow-hidden">
      {/* Header */}
      <div className="flex gap-4 p-4 border-b border-white/[0.06]">
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={i} className="h-3 flex-1 rounded" />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex gap-4 p-4 border-b border-white/[0.03] last:border-0">
          {Array.from({ length: cols }).map((_, c) => (
            <Skeleton key={c} className="h-3 flex-1 rounded" />
          ))}
        </div>
      ))}
    </SkeletonPanel>
  );
}

/* ─────────────────────────────────────────────
   AI Stylist Chat
   ───────────────────────────────────────────── */

export function SidebarListSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 p-3 rounded-xl">
          <Skeleton className="w-4 h-4 rounded" />
          <Skeleton className="h-3.5 flex-1 rounded" />
        </div>
      ))}
    </div>
  );
}

export function ChatSkeleton() {
  return (
    <div className="flex h-full gap-6">
      {/* Sidebar */}
      <div className="w-80 flex-shrink-0 flex flex-col gap-4">
        <Skeleton className="h-12 w-full rounded-xl" />
        <SidebarListSkeleton count={3} />
      </div>
      {/* Chat Panel */}
      <SkeletonPanel className="flex-1 flex flex-col">
        {/* Header */}
        <div className="flex items-center gap-3 p-5 border-b border-white/[0.06]">
          <Skeleton className="w-10 h-10 rounded-xl" />
          <div>
            <Skeleton className="h-4 w-28 rounded mb-1.5" />
            <Skeleton className="h-3 w-40 rounded" />
          </div>
        </div>
        {/* Messages area */}
        <div className="flex-1 p-6 space-y-5">
          <MessageBubbleSkeleton side="left" />
          <MessageBubbleSkeleton side="right" />
          <MessageBubbleSkeleton side="left" wide />
        </div>
        {/* Input bar */}
        <div className="p-4 border-t border-white/[0.06]">
          <Skeleton className="h-12 w-full rounded-xl" />
        </div>
      </SkeletonPanel>
    </div>
  );
}

function MessageBubbleSkeleton({ side, wide }: { side: "left" | "right"; wide?: boolean }) {
  return (
    <div className={cn("flex", side === "right" ? "justify-end" : "justify-start")}>
      <div className={cn("space-y-2", wide ? "w-3/4" : "w-1/2")}>
        <Skeleton className="h-3.5 w-full rounded" />
        <Skeleton className="h-3.5 w-4/5 rounded" />
        {wide && <Skeleton className="h-3.5 w-3/5 rounded" />}
      </div>
    </div>
  );
}

/** Small thinking indicator shown while the assistant is generating. */
export function ThinkingBubbleSkeleton() {
  return (
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 rounded-xl bg-brand-purple/20 flex items-center justify-center flex-shrink-0">
        <div className="w-4 h-4 rounded-md skeleton-shimmer" />
      </div>
      <div className="bg-surface-1/80 border border-white/[0.06] rounded-2xl rounded-tl-md px-4 py-3">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-white/20 animate-[pulse_1.2s_ease-in-out_infinite]" />
          <span className="w-2 h-2 rounded-full bg-white/20 animate-[pulse_1.2s_ease-in-out_0.2s_infinite]" />
          <span className="w-2 h-2 rounded-full bg-white/20 animate-[pulse_1.2s_ease-in-out_0.4s_infinite]" />
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Settings / Form
   ───────────────────────────────────────────── */

export function SettingsPanelSkeleton() {
  return (
    <div className="space-y-6 max-w-4xl">
      <SkeletonPanel className="p-6 md:p-8">
        <div className="flex items-center gap-5 mb-8">
          <Skeleton className="w-20 h-20 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-5 w-40 rounded" />
            <Skeleton className="h-3 w-56 rounded" />
          </div>
        </div>
        <FormRowsSkeleton count={4} />
      </SkeletonPanel>
    </div>
  );
}

export function FormSkeleton() {
  return (
    <SkeletonPanel className="p-6 md:p-8">
      <div className="flex items-center gap-3 mb-6">
        <Skeleton className="w-12 h-12 rounded-xl" />
        <div>
          <Skeleton className="h-5 w-36 rounded mb-2" />
          <Skeleton className="h-3 w-52 rounded" />
        </div>
      </div>
      <FormRowsSkeleton count={3} />
      <div className="flex gap-3 mt-6">
        <Skeleton className="h-10 w-32 rounded-lg" />
        <Skeleton className="h-10 w-28 rounded-lg" />
      </div>
    </SkeletonPanel>
  );
}

function FormRowsSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-5">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i}>
          <Skeleton className="h-3 w-24 rounded mb-2" />
          <Skeleton className="h-10 w-full rounded-lg" />
        </div>
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────
   Recommendations
   ───────────────────────────────────────────── */

export function RecommendationSkeleton() {
  return (
    <SkeletonPanel className="p-6">
      <div className="flex items-center gap-3 mb-5">
        <Skeleton className="w-10 h-10 rounded-xl" />
        <Skeleton className="h-5 w-44 rounded" />
      </div>
      <div className="grid grid-cols-3 gap-4 mb-5">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="aspect-square rounded-xl" />
        ))}
      </div>
      <div className="space-y-2">
        <Skeleton className="h-3 w-full rounded" />
        <Skeleton className="h-3 w-3/4 rounded" />
      </div>
    </SkeletonPanel>
  );
}

/* ─────────────────────────────────────────────
   Intelligence Card Grid
   ───────────────────────────────────────────── */

export function IntelligenceGridSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────
   Widget Mini Skeleton (for small dashboard widgets)
   ───────────────────────────────────────────── */

export function WidgetSkeleton() {
  return (
    <div className="space-y-4 p-2">
      <Skeleton className="h-4 w-32 rounded" />
      <div className="space-y-2.5">
        <Skeleton className="h-3 w-full rounded" />
        <Skeleton className="h-3 w-4/5 rounded" />
        <Skeleton className="h-3 w-3/5 rounded" />
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   AI Access Page Skeleton
   ───────────────────────────────────────────── */

export function AIAccessSkeleton() {
  return (
    <div className="max-w-4xl mx-auto pb-12">
      <div className="mb-8">
        <Skeleton className="h-8 w-52 rounded-lg mb-3" />
        <Skeleton className="h-4 w-96 rounded" />
      </div>
      <SkeletonPanel className="p-6 md:p-8 mb-6">
        <div className="flex items-center gap-4 mb-6">
          <Skeleton className="w-12 h-12 rounded-xl" />
          <div>
            <Skeleton className="h-5 w-36 rounded mb-2" />
            <Skeleton className="h-4 w-20 rounded-full" />
          </div>
        </div>
        <div className="bg-surface-2/50 rounded-xl p-4 mb-5">
          <div className="flex justify-between">
            <div>
              <Skeleton className="h-3 w-28 rounded mb-2" />
              <Skeleton className="h-4 w-36 rounded" />
            </div>
            <div>
              <Skeleton className="h-3 w-24 rounded mb-2" />
              <Skeleton className="h-4 w-40 rounded" />
            </div>
          </div>
        </div>
        <div className="flex gap-3">
          <Skeleton className="h-10 w-36 rounded-lg" />
          <Skeleton className="h-10 w-28 rounded-lg" />
        </div>
      </SkeletonPanel>
      <SkeletonPanel className="p-6 md:p-8">
        <Skeleton className="h-5 w-52 rounded mb-5" />
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-4 w-full rounded" />
          ))}
        </div>
      </SkeletonPanel>
    </div>
  );
}

/* ─────────────────────────────────────────────
   AI Usage Page Skeleton
   ───────────────────────────────────────────── */

export function AIUsageSkeleton() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <Skeleton className="h-8 w-48 rounded-lg mb-3" />
        <Skeleton className="h-4 w-96 rounded" />
      </div>
      <SkeletonPanel className="p-6">
        <div className="flex items-center gap-3 mb-5">
          <Skeleton className="w-10 h-10 rounded-xl" />
          <div>
            <Skeleton className="h-4 w-36 rounded mb-2" />
            <Skeleton className="h-3 w-48 rounded" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-surface-2/50 rounded-xl p-4">
            <Skeleton className="h-3 w-20 rounded mb-2" />
            <Skeleton className="h-5 w-32 rounded" />
          </div>
          <div className="bg-surface-2/50 rounded-xl p-4">
            <Skeleton className="h-3 w-24 rounded mb-2" />
            <Skeleton className="h-5 w-36 rounded" />
          </div>
        </div>
      </SkeletonPanel>
      <TableSkeleton rows={5} cols={5} />
    </div>
  );
}
