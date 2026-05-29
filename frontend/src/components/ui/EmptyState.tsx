import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center py-16 text-center", className)}>
      <div className="bg-charcoal/50 p-4 rounded-full mb-4 border border-white/5 text-cloudburst">
        {icon}
      </div>
      <h3 className="text-xl font-semibold text-porcelain mb-2">{title}</h3>
      <p className="text-cloudburst max-w-sm mb-6">{description}</p>
      {action}
    </div>
  );
}
