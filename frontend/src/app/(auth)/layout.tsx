"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { AuthVisualPanel } from "@/components/auth/auth-visual-panel";
import { SmartWardrobeLogo } from "@/components/branding/smart-wardrobe-logo";

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
          <Link href="/" className="inline-block hover:opacity-90 transition-opacity">
            <SmartWardrobeLogo variant="full" />
          </Link>
        </div>

        {/* Mobile-only compact visual banner */}
        <div className="lg:hidden px-6 pb-6 text-center">
          <h2 className="text-2xl font-bold text-text-primary mb-1">
            Smart Wardrobe{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-blue to-brand-purple">
              AI
            </span>
          </h2>
          <p className="text-text-secondary text-sm">Your AI-Powered Personal Styling Intelligence Platform</p>
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
