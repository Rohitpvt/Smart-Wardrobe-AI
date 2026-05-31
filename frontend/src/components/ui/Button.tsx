import { ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", isLoading, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          "inline-flex items-center justify-center rounded-xl font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyber-cyan/50 focus-visible:ring-offset-2 focus-visible:ring-offset-inkwell disabled:opacity-40 disabled:pointer-events-none disabled:cursor-not-allowed active:scale-[0.98]",
          {
            "bg-cyber-cyan text-inkwell font-semibold hover:bg-cyber-cyan/85 shadow-[0_0_20px_rgba(82,225,254,0.15)]": variant === "primary",
            "bg-surface-raised text-porcelain hover:bg-surface-overlay border border-border-subtle": variant === "secondary",
            "border border-border-default hover:border-border-strong hover:bg-white/5 text-porcelain": variant === "outline",
            "hover:bg-white/5 text-cloudburst hover:text-porcelain": variant === "ghost",
            "bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20": variant === "danger",
            "h-8 px-3 text-sm rounded-lg": size === "sm",
            "h-10 px-5 text-sm": size === "md",
            "h-12 px-8 text-base": size === "lg",
          },
          className
        )}
        {...props}
      >
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
export { Button };
