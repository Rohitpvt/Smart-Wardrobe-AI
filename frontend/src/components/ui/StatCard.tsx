import { Card, CardContent } from "./Card";
import { ReactNode } from "react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  description?: string;
}

export function StatCard({ title, value, icon, description }: StatCardProps) {
  return (
    <Card className="h-full">
      <CardContent className="p-5 flex items-start gap-4">
        <div className="p-3 bg-cyber-cyan/8 rounded-xl border border-cyber-cyan/10 text-cyber-cyan shrink-0">
          {icon}
        </div>
        <div className="min-w-0">
          <p className="text-sm text-cloudburst font-medium truncate">{title}</p>
          <h3 className="text-2xl font-bold text-porcelain tracking-tight mt-0.5">{value}</h3>
          {description && <p className="text-xs text-cloudburst/70 mt-1 truncate">{description}</p>}
        </div>
      </CardContent>
    </Card>
  );
}
