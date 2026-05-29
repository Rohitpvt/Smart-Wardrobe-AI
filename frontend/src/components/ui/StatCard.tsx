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
    <Card>
      <CardContent className="p-6 flex items-center gap-4">
        <div className="p-4 bg-white/5 rounded-xl border border-white/5 text-cyber-cyan">
          {icon}
        </div>
        <div>
          <p className="text-sm font-medium text-cloudburst">{title}</p>
          <h3 className="text-2xl font-bold text-porcelain mt-1">{value}</h3>
          {description && <p className="text-xs text-cloudburst mt-1">{description}</p>}
        </div>
      </CardContent>
    </Card>
  );
}
