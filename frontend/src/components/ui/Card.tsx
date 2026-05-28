/**
 * Smart Wardrobe AI — Card Component
 *
 * Variants based on DESIGN.md:
 * - basic: Carbon bg, 8px radius, 16px padding
 * - rounded: Carbon bg, 24px radius
 * - translucent: Translucent bg with inset border shadow
 * - subtle: Inkwell bg with subtle shadow
 */

import { cn } from "@/utils/cn";
import { HTMLAttributes, ReactNode } from "react";

type CardVariant = "basic" | "rounded" | "translucent" | "subtle";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  children: ReactNode;
  hover?: boolean;
  glow?: boolean;
}

const variantStyles: Record<CardVariant, string> = {
  basic: "bg-carbon rounded-[8px] p-4",
  rounded: "bg-carbon rounded-[24px] p-4",
  translucent: [
    "bg-[rgba(23,23,23,0.6)] rounded-[20px]",
    "shadow-[inset_0_0_0_1px_rgba(255,255,255,0.1),inset_0_1px_0_0_rgba(255,255,255,0.15)]",
  ].join(" "),
  subtle: "bg-inkwell rounded-[6px] shadow-subtle-2 px-6 py-4",
};

export default function Card({
  variant = "basic",
  children,
  hover = false,
  glow = false,
  className,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        variantStyles[variant],
        hover &&
          "transition-all duration-300 hover:translate-y-[-2px] hover:shadow-[inset_0_0_0_1px_rgba(82,225,254,0.15)]",
        glow && "animate-pulse-glow",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
