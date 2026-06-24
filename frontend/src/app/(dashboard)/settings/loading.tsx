import { SettingsPanelSkeleton, PageHeaderSkeleton } from "@/components/ui/skeleton-loaders";

export default function SettingsLoading() {
  return (
    <div className="space-y-8">
      <PageHeaderSkeleton />
      <SettingsPanelSkeleton />
    </div>
  );
}
