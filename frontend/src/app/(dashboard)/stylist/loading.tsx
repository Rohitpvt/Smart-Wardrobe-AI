import { ChatSkeleton } from "@/components/ui/skeleton-loaders";

export default function StylistLoading() {
  return (
    <div className="flex-1 h-[calc(100vh-6rem)] p-4 md:p-6 lg:p-8 max-w-7xl mx-auto w-full">
      <ChatSkeleton />
    </div>
  );
}
