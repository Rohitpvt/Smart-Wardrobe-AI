/**
 * Smart Wardrobe AI — Badge Component
 *
 * Monospace badge for labels, tags, and status indicators.
 * Based on DESIGN.md Badge - Monospace specification.
 */

import { cn } from "@/utils/cn";
import { ReactNode } from "react";

type BadgeVariant = "default" | "cyan" | "orange" | "success" | "warning";

interface BadgeProps {
  variant?: BadgeVariant;
  children: ReactNode;
  className?: string;
  dot?: boolean;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: "text-muted",
  cyan: "text-cyber-cyan",
  orange: "text-code-orange",
  success: "text-emerald-400",
  warning: "text-amber-400",
};

const dotColors: Record<BadgeVariant, string> = {
  default: "bg-muted",
  cyan: "bg-cyber-cyan",
  orange: "bg-code-orange",
  success: "bg-emerald-400",
  warning: "bg-amber-400",
};

export default function Badge({
  variant = "default",
  children,
  className,
  dot = false,
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5",
        "font-[family-name:var(--font-mono)] text-[13px] leading-[1.3] tracking-normal",
        variantStyles[variant],
        className
      )}
    >
      {dot && (
        <span
          className={cn(
            "w-1.5 h-1.5 rounded-full flex-shrink-0",
            dotColors[variant]
          )}
        />
      )}
      {children}
    </span>
  );
}
