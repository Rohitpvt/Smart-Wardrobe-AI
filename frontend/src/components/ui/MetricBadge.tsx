import React, { ReactNode } from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface MetricBadgeProps {
  icon?: ReactNode;
  label: string;
  className?: string;
  variant?: "brand" | "success" | "warning";
}

export function MetricBadge({ icon, label, className, variant = "brand" }: MetricBadgeProps) {
  const variantStyles = {
    brand: "bg-brand-purple/10 border-brand-purple/20 text-brand-purple",
    success: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
    warning: "bg-yellow-500/10 border-yellow-500/20 text-yellow-500"
  };

  return (
    <div className={cn(
      "inline-flex items-center gap-2 px-3 py-1 rounded-full border",
      variantStyles[variant],
      className
    )}>
      {icon}
      <span className="text-xs font-label-md uppercase tracking-widest font-semibold">{label}</span>
    </div>
  );
}
