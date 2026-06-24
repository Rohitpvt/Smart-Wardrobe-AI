import { PageHeaderSkeleton, StatsGridSkeleton, WardrobeFilterSkeleton, WardrobeGridSkeleton } from "@/components/ui/skeleton-loaders";

export default function WardrobeLoading() {
  return (
    <div className="space-y-8">
      <PageHeaderSkeleton />
      <StatsGridSkeleton count={4} />
      <WardrobeFilterSkeleton />
      <WardrobeGridSkeleton count={10} />
    </div>
  );
}
