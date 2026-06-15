import React, { ReactNode } from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface SectionHeaderProps {
  icon?: ReactNode;
  title: string;
  subtitle?: string;
  className?: string;
  iconClassName?: string;
  action?: ReactNode;
}

export function SectionHeader({ icon, title, subtitle, className, iconClassName, action }: SectionHeaderProps) {
  return (
    <div className={cn("flex items-center justify-between mb-8 pb-6 border-b border-white/5", className)}>
      <div className="flex items-center gap-3">
        {icon && (
          <div className={cn("text-brand-blue", iconClassName)}>
            {icon}
          </div>
        )}
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">{title}</h2>
          {subtitle && <p className="text-sm text-slate-400 mt-1">{subtitle}</p>}
        </div>
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}
