"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { AuthVisualPanel } from "@/components/auth/auth-visual-panel";
import { Sparkles } from "lucide-react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-background font-sans">
      {/* Left Visual Panel — hidden on mobile, shown on lg+ */}
      <div className="hidden lg:flex lg:w-1/2 relative">
        <AuthVisualPanel />
      </div>

      {/* Right Form Panel */}
      <div className="w-full lg:w-1/2 flex flex-col min-h-screen relative">
        {/* Subtle background glow for form panel */}
        <div className="absolute top-[-20%] right-[-20%] w-[60%] h-[50%] bg-brand-blue/8 blur-[100px] rounded-full pointer-events-none lg:hidden" />

        {/* Top bar with logo + nav */}
        <div className="flex items-center justify-between p-6 relative z-20">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-blue to-brand-purple flex items-center justify-center transition-transform group-hover:scale-105">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-text-primary text-lg hidden sm:inline">
              Wardrobe AI
            </span>
          </Link>
        </div>

        {/* Mobile-only compact visual banner */}
        <div className="lg:hidden px-6 pb-6 text-center">
          <h2 className="text-2xl font-bold text-text-primary mb-1">
            Your AI Stylist.{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-blue to-brand-purple">
              Reimagined.
            </span>
          </h2>
          <p className="text-text-secondary text-sm">Smart outfits powered by your wardrobe.</p>
        </div>

        {/* Form container — centered vertically */}
        <div className="flex-1 flex items-center justify-center px-6 pb-12 relative z-10">
          <div className="w-full max-w-[480px]">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
