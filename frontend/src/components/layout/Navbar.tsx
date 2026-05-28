/**
 * Smart Wardrobe AI — Navbar Component
 *
 * Sticky top navigation bar with:
 * - Logo/brand name
 * - Navigation links (scroll-to anchors on landing)
 * - CTA button (Get Started)
 * - Mobile-responsive hamburger menu
 */

"use client";

import { useState } from "react";
import { APP_NAME, NAVIGATION_LINKS } from "@/lib/constants";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { cn } from "@/utils/cn";

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav
      className="sticky top-0 z-50 border-b border-starlight/10 backdrop-blur-xl bg-charcoal/80"
      id="navbar"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo + Brand */}
          <div className="flex items-center gap-3">
            {/* Logo icon — wardrobe/hanger shape */}
            <div className="w-8 h-8 rounded-[8px] bg-carbon flex items-center justify-center shadow-[inset_0_0_0_1px_rgba(82,225,254,0.2)]">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-cyber-cyan"
              >
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
              </svg>
            </div>
            <span className="text-[16px] font-medium text-porcelain tracking-tight">
              {APP_NAME}
            </span>
            <Badge variant="cyan" className="hidden sm:inline-flex">
              v0.1
            </Badge>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {NAVIGATION_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="px-3 py-2 text-[14px] text-cloudburst hover:text-porcelain transition-colors duration-200 rounded-[8px] hover:bg-porcelain/5"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-3">
            <Button variant="ghost" size="sm">
              Sign In
            </Button>
            <Button variant="filled" size="sm">
              Get Started
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-cloudburst hover:text-porcelain transition-colors cursor-pointer"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
            id="mobile-menu-toggle"
          >
            {mobileMenuOpen ? (
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              >
                <path d="M18 6L6 18" />
                <path d="M6 6l12 12" />
              </svg>
            ) : (
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              >
                <path d="M3 12h18" />
                <path d="M3 6h18" />
                <path d="M3 18h18" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={cn(
          "md:hidden overflow-hidden transition-all duration-300 border-t border-starlight/10",
          mobileMenuOpen ? "max-h-80 opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <div className="px-4 py-4 space-y-2 bg-charcoal/95 backdrop-blur-xl">
          {NAVIGATION_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="block px-3 py-2 text-[14px] text-cloudburst hover:text-porcelain transition-colors rounded-[8px] hover:bg-porcelain/5"
              onClick={() => setMobileMenuOpen(false)}
            >
              {link.label}
            </a>
          ))}
          <div className="pt-2 border-t border-starlight/10 space-y-2">
            <Button variant="ghost" size="sm" className="w-full justify-center">
              Sign In
            </Button>
            <Button
              variant="filled"
              size="sm"
              className="w-full justify-center"
            >
              Get Started
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
