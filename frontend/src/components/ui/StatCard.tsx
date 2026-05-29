import Card from "./Card";
import Badge from "./Badge";

interface StatCardProps {
  label: string;
  value: string | number;
  subValue?: string;
  badgeVariant?: "default" | "cyan" | "orange" | "success" | "warning";
  className?: string;
}

export default function StatCard({ label, value, subValue, badgeVariant = "cyan", className }: StatCardProps) {
  return (
    <Card variant="translucent" className={`p-5 flex flex-col justify-between h-32 ${className || ""}`}>
      <Badge variant={badgeVariant} className="self-start px-2 py-0.5 rounded border border-current/20 bg-current/5">
        {label}
      </Badge>
      <div className="mt-auto flex items-baseline gap-2">
        <p className="text-3xl font-medium text-porcelain font-[family-name:var(--font-mono)] tracking-tight">
          {value}
        </p>
        {subValue && (
          <p className="text-sm text-cloudburst">{subValue}</p>
        )}
      </div>
    </Card>
  );
}
