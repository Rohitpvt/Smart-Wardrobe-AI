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
    <div className={cn(
      "flex flex-col items-center justify-center py-20 px-6 text-center rounded-2xl border border-dashed border-border-default bg-surface/50",
      className
    )}>
      <div className="p-5 rounded-2xl mb-5 bg-surface-raised border border-border-subtle text-cloudburst">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-porcelain mb-2">{title}</h3>
      <p className="text-sm text-cloudburst max-w-sm mb-6 leading-relaxed">{description}</p>
      {action}
    </div>
  );
}
