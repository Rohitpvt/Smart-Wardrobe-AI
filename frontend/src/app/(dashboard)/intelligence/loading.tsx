import { PageHeaderSkeleton, IntelligenceGridSkeleton } from "@/components/ui/skeleton-loaders";

export default function IntelligenceLoading() {
  return (
    <div className="space-y-8">
      <PageHeaderSkeleton />
      <IntelligenceGridSkeleton count={4} />
    </div>
  );
}
