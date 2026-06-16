import React from "react";
import { cn } from "@/lib/utils";

interface SmartWardrobeLogoProps {
  variant?: "full" | "compact" | "favicon";
  className?: string;
}

export function SmartWardrobeLogo({
  variant = "full",
  className,
}: SmartWardrobeLogoProps) {
  const isFavicon = variant === "favicon";
  const isCompact = variant === "compact";
  const isFull = variant === "full";

  // Container sizes
  const containerClass = cn(
    "bg-gradient-to-br from-brand-blue to-brand-purple p-px shadow-[0_0_20px_rgba(59,130,246,0.3)] flex-shrink-0",
    {
      "w-10 h-10 rounded-xl": isFull,
      "w-8 h-8 rounded-lg": isCompact,
      "w-full h-full rounded-none": isFavicon, // For favicon generation, we might want it to fill
    }
  );

  const innerContainerClass = cn(
    "w-full h-full bg-[#060816] flex items-center justify-center relative overflow-hidden",
    {
      "rounded-[11px]": isFull,
      "rounded-[7px]": isCompact,
      "rounded-none": isFavicon,
    }
  );

  const svgWrapperClass = cn(
    "relative flex items-center justify-center",
    {
      "w-5 h-5": isFull,
      "w-4 h-4": isCompact,
      "w-[60%] h-[60%]": isFavicon,
    }
  );

  // Clean, premium integrated SVG
  // hook ends in a solid neural node dot.
  const Icon = () => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={isFavicon ? "3" : "2.5"} // Thicker for favicon for readability
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-brand-blue absolute inset-0 drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]"
    >
      {/* Hanger Base */}
      <path d="M12 9C7 9.5 2 13.5 2 15.5C2 17 5.5 18 12 18C18.5 18 22 17 22 15.5C22 13.5 17 9.5 12 9Z" />
      {/* Hanger Bar */}
      <path d="M2 15.5H22" />
      {/* Hook leading up to Neural Node */}
      <path d="M12 9V7C12 5.5 13.5 5 13.5 3.5C13.5 2.5 12.8 2 12 2" />
      {/* Neural Node integrated into hook tip */}
      <circle cx="12" cy="2" r={isFavicon ? "2.5" : "1.5"} fill="currentColor" stroke="none" className="text-brand-purple drop-shadow-[0_0_6px_rgba(168,85,247,0.8)]" />
    </svg>
  );

  if (isFavicon) {
    // For favicon generation script to capture a clean scalable block
    return (
      <div className={containerClass}>
        <div className={innerContainerClass}>
          <div className="absolute inset-0 bg-brand-blue/10 blur-[10px]" />
          <div className={svgWrapperClass}>
            <Icon />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("flex items-center gap-3", className)}>
      {/* Icon Container */}
      <div className={containerClass}>
        <div className={innerContainerClass}>
          <div className="absolute inset-0 bg-brand-blue/10 blur-[10px]" />
          <div className={svgWrapperClass}>
            <Icon />
          </div>
        </div>
      </div>

      {/* Text Container */}
      {isFull && (
        <div className="flex flex-col justify-center">
          <h2
            className="font-bold tracking-tight text-white leading-none text-xl whitespace-nowrap"
            style={{ letterSpacing: "-0.02em" }}
          >
            Smart Wardrobe <span className="text-brand-blue">AI</span>
          </h2>
          
          {/* Subtitle - less dominant */}
          <p className="text-[10px] font-medium text-slate-500 mt-1.5 uppercase tracking-widest leading-none">
            Personal Style Intelligence
          </p>
        </div>
      )}
    </div>
  );
}
