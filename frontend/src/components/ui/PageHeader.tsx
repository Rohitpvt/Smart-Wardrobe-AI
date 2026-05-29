import { ReactNode } from "react";
import Badge from "./Badge";

interface PageHeaderProps {
  title: string;
  description?: string;
  badge?: {
    text: string;
    variant?: "default" | "cyan" | "orange" | "success" | "warning";
  };
  actions?: ReactNode;
}

export default function PageHeader({ title, description, badge, actions }: PageHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <h1 className="text-2xl md:text-3xl font-medium tracking-tight text-porcelain">
            {title}
          </h1>
          {badge && (
            <Badge variant={badge.variant || "cyan"} className="hidden md:inline-flex px-2 py-0.5 rounded border border-current/20 bg-current/5">
              {badge.text}
            </Badge>
          )}
        </div>
        {description && (
          <p className="text-cloudburst text-sm md:text-base">
            {description}
          </p>
        )}
      </div>
      {actions && (
        <div className="flex items-center gap-3 shrink-0">
          {actions}
        </div>
      )}
    </div>
  );
}
