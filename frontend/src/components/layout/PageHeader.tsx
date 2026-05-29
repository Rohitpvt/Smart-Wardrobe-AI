import { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  description?: string;
  action?: ReactNode;
}

export function PageHeader({ title, description, action }: PageHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-porcelain tracking-tight">{title}</h1>
        {description && <p className="text-cloudburst mt-1">{description}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}
