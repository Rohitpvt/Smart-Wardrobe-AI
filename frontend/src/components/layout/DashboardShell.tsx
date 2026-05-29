"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import Button from "@/components/ui/Button";

interface DashboardShellProps {
  children: ReactNode;
}

export default function DashboardShell({ children }: DashboardShellProps) {
  const pathname = usePathname();
  const { logout, user } = useAuth();

  const navItems = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Wardrobe", href: "/wardrobe" },
    { label: "Upload", href: "/upload" },
    { label: "Outfit AI", href: "/outfit-ai" },
    { label: "Weather Style", href: "/weather-style" },
    { label: "Saved Outfits", href: "/outfits/saved" },
    { label: "History", href: "/outfits/history" },
  ];

  return (
    <div className="min-h-screen bg-charcoal text-porcelain flex flex-col md:flex-row font-inter">
      {/* Sidebar (Desktop) / Top Nav (Mobile) */}
      <nav className="w-full md:w-64 bg-carbon border-b md:border-b-0 md:border-r border-starlight/10 flex-shrink-0 z-10 sticky top-0 md:h-screen overflow-y-auto">
        <div className="p-6 flex flex-col h-full">
          {/* Logo Area */}
          <div className="mb-8 flex items-center justify-between md:justify-start">
            <Link href="/dashboard" className="text-xl font-medium tracking-tight text-porcelain flex items-center gap-2">
              <span className="w-6 h-6 rounded bg-cyber-cyan/10 border border-cyber-cyan/30 flex items-center justify-center text-cyber-cyan text-sm">✦</span>
              Midnight AI
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="flex md:flex-col gap-2 overflow-x-auto md:overflow-visible pb-4 md:pb-0 scrollbar-none flex-grow">
            {navItems.map((item) => {
              const isActive = pathname === item.href || (pathname.startsWith(item.href) && item.href !== "/dashboard");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`whitespace-nowrap px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-inkwell text-porcelain shadow-subtle border border-starlight/5"
                      : "text-cloudburst hover:text-porcelain hover:bg-inkwell/50"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>

          {/* User Section (Desktop Only) */}
          <div className="hidden md:block mt-auto pt-6 border-t border-starlight/10">
            <div className="mb-4">
              <p className="text-sm font-medium text-porcelain truncate">{user?.full_name || "User"}</p>
              <p className="text-xs text-cloudburst truncate">{user?.email}</p>
            </div>
            <Button variant="ghost" className="w-full justify-start text-cloudburst hover:text-porcelain hover:bg-inkwell" onClick={logout}>
              Log out
            </Button>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 w-full relative">
        {/* Subtle decorative glow for the page content area */}
        <div className="absolute top-0 left-0 w-full h-96 bg-glow-blue pointer-events-none -z-10" />
        
        {children}
      </main>
    </div>
  );
}
