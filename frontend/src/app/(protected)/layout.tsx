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

  const closeMenu = () => setMobileMenuOpen(false);

  return (
    <div className="flex h-screen bg-inkwell text-porcelain overflow-hidden">
      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm"
          onClick={closeMenu}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-charcoal/80 backdrop-blur-xl border-r border-white/5 transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 flex flex-col",
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center justify-between p-6">
          <Link href="/dashboard" className="text-xl font-bold tracking-tight text-porcelain" onClick={closeMenu}>
            Smart <span className="text-cyber-cyan">Wardrobe</span>
          </Link>
          <button className="lg:hidden text-cloudburst" onClick={closeMenu}>
            <X className="h-6 w-6" />
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-1 overflow-y-auto mt-4">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={closeMenu}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors font-medium text-sm",
                  isActive 
                    ? "bg-cyber-cyan/10 text-cyber-cyan" 
                    : "text-cloudburst hover:bg-white/5 hover:text-porcelain"
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/5">
          <button
            onClick={() => logout()}
            className="flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-cloudburst hover:bg-white/5 hover:text-red-400 transition-colors font-medium text-sm"
          >
            <LogOut className="h-5 w-5" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Topbar for mobile */}
        <header className="lg:hidden flex items-center justify-between p-4 bg-charcoal/50 border-b border-white/5 backdrop-blur-md z-30">
          <Link href="/dashboard" className="text-lg font-bold text-porcelain">
            Smart <span className="text-cyber-cyan">Wardrobe</span>
          </Link>
          <button className="text-porcelain" onClick={() => setMobileMenuOpen(true)}>
            <Menu className="h-6 w-6" />
          </button>
        </header>

        {/* Content Scrollable Area */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-8">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
