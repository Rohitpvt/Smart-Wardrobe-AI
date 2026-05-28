/**
 * Smart Wardrobe AI — Button Component
 *
 * Variants based on DESIGN.md:
 * - filled: White bg, black text (primary CTA)
 * - ghost: Transparent bg, muted text
 * - ghost-cyan: Transparent bg, Cyber Cyan text
 */

import { cn } from "@/utils/cn";
import { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "filled" | "ghost" | "ghost-cyan";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: ReactNode;
  icon?: ReactNode;
}

const variantStyles: Record<ButtonVariant, string> = {
  filled:
    "bg-porcelain text-carbon hover:bg-starlight active:bg-lunar-dust transition-colors duration-200",
  ghost:
    "bg-transparent text-cloudburst hover:text-porcelain transition-colors duration-200",
  "ghost-cyan":
    "bg-transparent text-cyber-cyan hover:text-porcelain transition-colors duration-200",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "px-3 py-1.5 text-[13px] rounded-[8px]",
  md: "px-4 py-2.5 text-[14px] rounded-[12px]",
  lg: "px-6 py-3 text-[16px] rounded-[12px]",
};

export default function Button({
  variant = "filled",
  size = "md",
  children,
  icon,
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 font-medium cursor-pointer",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-cyber-cyan/40 focus-visible:ring-offset-2 focus-visible:ring-offset-charcoal",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      {children}
    </button>
  );
}
