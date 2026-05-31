"use client";

import { useAuth } from "@/hooks/useAuth";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { 
  LayoutDashboard, 
  Shirt, 
  UploadCloud, 
  CloudSun, 
  Sparkles, 
  Bookmark, 
  BarChart3, 
  User as UserIcon,
  LogOut,
  Menu,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/wardrobe", icon: Shirt, label: "Wardrobe" },
  { href: "/upload", icon: UploadCloud, label: "Upload & Analyze" },
  { href: "/weather-style", icon: CloudSun, label: "Weather Style" },
  { href: "/outfits/recommendations", icon: Sparkles, label: "Get Recommendations" },
  { href: "/outfits/saved", icon: Bookmark, label: "Saved Outfits" },
  { href: "/analytics", icon: BarChart3, label: "Analytics" },
  { href: "/profile", icon: UserIcon, label: "Profile" },
];

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);



  if (loading || !user) return <div className="min-h-screen bg-inkwell" />;

  const initials = user.full_name
    ?.split(" ")
    .map((n: string) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "U";

  return (
    <div className="flex h-screen bg-inkwell text-porcelain overflow-hidden">
      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-60 bg-surface border-r border-border-subtle transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 flex flex-col",
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-5 h-16 border-b border-border-subtle shrink-0">
          <Link href="/dashboard" className="text-lg font-bold tracking-tight text-porcelain" onClick={() => setMobileMenuOpen(false)}>
            Smart <span className="text-cyber-cyan">Wardrobe</span>
          </Link>
          <button className="lg:hidden text-cloudburst hover:text-porcelain transition-colors" onClick={() => setMobileMenuOpen(false)}>
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-[13px] font-medium",
                  isActive 
                    ? "bg-white/8 text-porcelain" 
                    : "text-cloudburst hover:bg-white/5 hover:text-porcelain"
                )}
              >
                <item.icon className={cn("h-[18px] w-[18px] shrink-0", isActive && "text-cyber-cyan")} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* User Footer */}
        <div className="p-3 border-t border-border-subtle space-y-1">
          <div className="flex items-center gap-3 px-3 py-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyber-cyan/10 border border-cyber-cyan/20 flex items-center justify-center text-cyber-cyan text-xs font-bold shrink-0">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-porcelain truncate">{user.full_name}</p>
              <p className="text-[11px] text-cloudburst truncate">{user.email}</p>
            </div>
          </div>
          <button
            onClick={() => logout()}
            className="flex w-full items-center gap-3 px-3 py-2 rounded-xl text-cloudburst hover:bg-red-500/8 hover:text-red-400 transition-all duration-200 text-[13px] font-medium"
          >
            <LogOut className="h-[18px] w-[18px]" />
            Log out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Topbar for mobile */}
        <header className="lg:hidden flex items-center justify-between px-4 h-14 bg-surface/90 border-b border-border-subtle backdrop-blur-xl z-30 shrink-0">
          <Link href="/dashboard" className="text-base font-bold text-porcelain">
            Smart <span className="text-cyber-cyan">Wardrobe</span>
          </Link>
          <button className="p-1.5 rounded-lg hover:bg-white/5 text-porcelain transition-colors" onClick={() => setMobileMenuOpen(true)}>
            <Menu className="h-5 w-5" />
          </button>
        </header>

        {/* Content Scrollable Area */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-5 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
