import { PageHeaderSkeleton, RecommendationSkeleton } from "@/components/ui/skeleton-loaders";

export default function RecommendationsLoading() {
  return (
    <div className="space-y-8">
      <PageHeaderSkeleton />
      <div className="space-y-6">
        <RecommendationSkeleton />
        <RecommendationSkeleton />
        <RecommendationSkeleton />
      </div>
    </div>
  );
}
