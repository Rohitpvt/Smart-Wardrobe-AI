"use client";

import React, { ReactNode } from "react";
import { m, HTMLMotionProps } from "framer-motion";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface GlassPanelProps extends HTMLMotionProps<"div"> {
  children?: ReactNode;
  interactive?: boolean;
}

export function GlassPanel({ children, className, interactive = false, ...props }: GlassPanelProps) {
  return (
    <m.div
      className={cn(
        "rounded-[2rem] bg-surface-1/70 backdrop-blur-xl border border-white/10 relative overflow-hidden",
        interactive && "hover:border-white/20 hover:-translate-y-1 hover:shadow-2xl transition-all duration-300 cursor-pointer group",
        className
      )}
      {...props}
    >
      {interactive && (
         <div className="absolute inset-0 bg-gradient-to-br from-brand-blue/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      )}
      {children}
    </m.div>
  );
}
