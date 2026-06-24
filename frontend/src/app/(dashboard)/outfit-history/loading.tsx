import { PageHeaderSkeleton, TableSkeleton } from "@/components/ui/skeleton-loaders";

export default function OutfitHistoryLoading() {
  return (
    <div className="space-y-8">
      <PageHeaderSkeleton />
      <TableSkeleton rows={8} cols={5} />
    </div>
  );
}
