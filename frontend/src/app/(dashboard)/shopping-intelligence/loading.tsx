import { PageHeaderSkeleton, CardSkeleton } from "@/components/ui/skeleton-loaders";

export default function ShoppingIntelligenceLoading() {
  return (
    <div className="space-y-8">
      <PageHeaderSkeleton />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <CardSkeleton />
        <CardSkeleton />
      </div>
    </div>
  );
}
