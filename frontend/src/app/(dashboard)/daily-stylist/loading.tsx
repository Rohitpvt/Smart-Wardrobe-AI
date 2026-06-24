import { PageHeaderSkeleton, CardSkeleton } from "@/components/ui/skeleton-loaders";

export default function DailyStylistLoading() {
  return (
    <div className="space-y-8">
      <PageHeaderSkeleton />
      <CardSkeleton className="h-64" />
    </div>
  );
}
