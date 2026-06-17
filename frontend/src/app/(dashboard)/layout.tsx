"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useState, useEffect } from "react";
import { AuthGuard } from "@/components/auth/auth-guard";
import { ErrorBoundary } from "@/components/error/ErrorBoundary";
import { api } from "@/lib/axios";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { m, AnimatePresence } from "framer-motion";
import { 
  LayoutDashboard, 
  Shirt, 
  UploadCloud, 
  Wand2, 
  Settings2, 
  LogOut, 
  Search, 
  Bell, 
  User, 
  CloudSun, 
  Menu, 
  X,
  ChevronRight,
  Command,
  MessageSquare,
  Brain,
  Sparkles,
  CalendarDays,
  Telescope,
  ShoppingBag,
  History
} from "lucide-react";

import { AmbientGlow } from "@/components/ui/AmbientGlow";
import { SmartWardrobeLogo } from "@/components/branding/smart-wardrobe-logo";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [profileData, setProfileData] = useState<{ first_name: string; last_name: string } | null>(null);

  useEffect(() => {
    // Fetch profile to populate the user dropdown gracefully (no strict requirements, just enhancement)
    api.get("/users/me")
      .then(res => setProfileData({ first_name: res.data.first_name, last_name: res.data.last_name }))
      .catch(() => {});
  }, []);

  const navLinks = [
    { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
    { href: "/wardrobe", label: "Wardrobe", icon: Shirt },
    { href: "/wardrobe/upload", label: "Upload", icon: UploadCloud },
    { href: "/recommendations", label: "Recommendations", icon: Wand2 },
    { href: "/outfit-history", label: "Outfit History", icon: History },
    { href: "/intelligence", label: "Intelligence", icon: Brain },
    { href: "/daily-stylist", label: "Daily Stylist", icon: CalendarDays },
    { href: "/predictive-stylist", label: "Predictive Stylist", icon: Telescope },
    { href: "/shopping-intelligence", label: "Shopping Intelligence", icon: ShoppingBag },
    { href: "/style-memory", label: "Style Memory", icon: Sparkles },
    { href: "/stylist", label: "AI Stylist", icon: MessageSquare },
    { href: "/settings", label: "Settings", icon: Settings2 },
  ];

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout");
    } catch (e) {
      console.error("Logout API failed", e);
    } finally {
      queryClient.clear();
      router.replace("/login");
    }
  };

  const currentRouteName = navLinks.find(link => pathname === link.href || (link.href !== "/dashboard" && pathname.startsWith(link.href)))?.label || "Workspace";

  return (
    <AuthGuard>
      <div className="flex h-screen bg-[#02040a] font-sans overflow-hidden selection:bg-brand-blue/30 selection:text-white">
        
        {/* ═══ SECTION 6: AMBIENT VISUAL SYSTEM ═══ */}
        <AmbientGlow />

        {/* ═══ SECTION 1: PREMIUM SIDEBAR (DESKTOP) ═══ */}
        <aside className="hidden lg:flex flex-col w-[280px] h-full border-r border-white/5 bg-surface-1/40 backdrop-blur-3xl relative z-20">
          
          {/* Brand Area */}
          <div className="p-6 pb-4">
            <SmartWardrobeLogo variant="full" />
          </div>

          {/* Navigation Intelligence */}
          <nav className="flex-1 px-4 space-y-2 mt-4 overflow-y-auto custom-scrollbar">
            <div className="px-4 mb-4 text-xs font-label-md text-slate-500 uppercase tracking-widest">Main Menu</div>
            {navLinks.map((link) => {
              const isActive = pathname === link.href || (link.href !== "/dashboard" && pathname.startsWith(link.href));
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="block relative group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue rounded-xl"
                  aria-label={link.label}
                  aria-current={isActive ? "page" : undefined}
                >
                  {/* Active Indicator & Hover Glow */}
                  {isActive && (
                    <m.div 
                      layoutId="activeNavIndicator"
                      className="absolute inset-0 bg-brand-blue/10 border border-brand-blue/20 rounded-xl" 
                    />
                  )}
                  <div className="absolute inset-0 bg-surface-2 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  <div className={`relative z-10 flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium transition-all duration-300 ${
                    isActive ? "text-brand-blue shadow-[0_0_20px_rgba(59,130,246,0.1)]" : "text-slate-400 group-hover:text-white"
                  }`}>
                    <Icon className={`w-5 h-5 transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
                    {link.label}
                  </div>
                </Link>
              );
            })}
          </nav>

          {/* User Profile / Logout */}
          <div className="p-4 mt-auto border-t border-white/5 bg-surface-1/50">
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium text-slate-400 hover:bg-red-500/10 hover:text-red-400 border border-transparent hover:border-red-500/20 transition-all group"
            >
              <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              Sign Out
            </button>
          </div>
        </aside>

        {/* ═══ MOBILE NAVIGATION (DRAWER) ═══ */}
        <AnimatePresence>
          {isMobileNavOpen && (
            <>
              <m.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }} 
                className="fixed inset-0 bg-[#02040a]/80 backdrop-blur-md z-40 lg:hidden"
                onClick={() => setIsMobileNavOpen(false)}
              />
              <m.aside 
                id="mobile-drawer"
                role="dialog"
                aria-modal="true"
                aria-label="Mobile Navigation"
                initial={{ x: "-100%" }} 
                animate={{ x: 0 }} 
                exit={{ x: "-100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="fixed top-0 left-0 w-[280px] h-full bg-surface-1 border-r border-white/10 z-50 flex flex-col lg:hidden shadow-2xl"
              >
                <div className="p-6 flex items-center justify-between border-b border-white/5">
                  <SmartWardrobeLogo variant="compact" />
                  <button onClick={() => setIsMobileNavOpen(false)} aria-label="Close mobile menu" className="p-2 text-slate-400 hover:text-white bg-surface-2 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
                  {navLinks.map((link) => {
                    const isActive = pathname === link.href || (link.href !== "/dashboard" && pathname.startsWith(link.href));
                    const Icon = link.icon;
                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setIsMobileNavOpen(false)}
                        className={`flex items-center gap-3 px-4 py-4 rounded-xl text-base font-medium transition-all ${
                          isActive ? "bg-brand-blue/10 text-brand-blue border border-brand-blue/20" : "text-slate-400 hover:bg-surface-2 hover:text-white"
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        {link.label}
                      </Link>
                    );
                  })}
                </nav>

                <div className="p-6 border-t border-white/5">
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center justify-center gap-2 px-4 py-3.5 rounded-xl text-sm font-medium text-red-400 bg-red-500/10 hover:bg-red-500/20 transition-all"
                  >
                    <LogOut className="w-4 h-4" /> Sign Out
                  </button>
                </div>
              </m.aside>
            </>
          )}
        </AnimatePresence>

        {/* ═══ MAIN CONTENT AREA ═══ */}
        <div className="flex-1 flex flex-col h-full relative z-10 overflow-hidden">
          
          {/* ═══ SECTION 2: GLOBAL HEADER ═══ */}
          <header className="h-[88px] shrink-0 border-b border-white/5 bg-surface-1/40 backdrop-blur-xl flex items-center justify-between px-6 md:px-10 z-20 sticky top-0">
            
            {/* Mobile Toggle & Breadcrumbs */}
            <div className="flex items-center gap-4">
              <button 
                className="lg:hidden p-2 text-slate-400 hover:text-white bg-surface-2 border border-white/5 rounded-xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue"
                onClick={() => setIsMobileNavOpen(true)}
                aria-label="Toggle mobile menu"
                aria-expanded={isMobileNavOpen}
                aria-controls="mobile-drawer"
              >
                <Menu className="w-5 h-5" />
              </button>
              
              <div className="hidden md:flex items-center gap-2 text-sm">
                <span className="text-slate-500">Workspace</span>
                <ChevronRight className="w-4 h-4 text-slate-600" />
                <span className="text-white font-medium drop-shadow-md">{currentRouteName}</span>
              </div>
            </div>

            {/* Global Actions */}
            <div className="flex items-center gap-4 md:gap-6">
              
              {/* Global Search Trigger */}
              <button 
                onClick={() => setIsSearchOpen(true)}
                aria-label="Open search command palette"
                aria-expanded={isSearchOpen}
                className="hidden sm:flex items-center gap-3 px-4 py-2.5 bg-surface-2/50 hover:bg-surface-2 border border-white/5 rounded-xl text-sm text-slate-400 transition-all group w-64 shadow-[inset_0_1px_2px_rgba(0,0,0,0.2)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue"
              >
                <Search className="w-4 h-4 group-hover:text-brand-blue transition-colors" />
                <span>Search wardrobe...</span>
                <div className="ml-auto flex items-center gap-1 text-[10px] bg-[#060816] px-1.5 py-0.5 rounded border border-white/10">
                  <Command className="w-3 h-3" /> K
                </div>
              </button>
              
              <button onClick={() => setIsSearchOpen(true)} aria-label="Open search command palette" aria-expanded={isSearchOpen} className="sm:hidden p-2.5 text-slate-400 bg-surface-2 border border-white/5 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue">
                <Search className="w-5 h-5" />
              </button>

              <div className="h-6 w-px bg-white/10 hidden md:block" />

              {/* Weather Summary Badge */}
              <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-brand-blue/5 border border-brand-blue/10 rounded-lg text-xs font-medium text-brand-blue">
                <CloudSun className="w-4 h-4" />
                <span>Live Sync</span>
              </div>

              {/* Notifications */}
              <button aria-label="View notifications" className="relative p-2.5 text-slate-400 hover:text-white bg-surface-2 border border-white/5 rounded-xl transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue">
                <Bell className="w-5 h-5" />
                <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-brand-purple rounded-full border border-surface-2" />
              </button>

              {/* Profile Dropdown Placeholder */}
              <button aria-label="User profile" className="w-10 h-10 rounded-xl bg-surface-2 border border-white/10 flex items-center justify-center text-slate-300 hover:border-brand-blue/50 cursor-pointer transition-all shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue">
                {profileData?.first_name ? (
                  <span className="font-bold text-sm uppercase">{profileData.first_name[0]}{profileData.last_name?.[0]}</span>
                ) : (
                  <User className="w-5 h-5" />
                )}
              </button>

            </div>
          </header>

          {/* ═══ SECTION 7: PAGE TRANSITION SYSTEM ═══ */}
          <main className="flex-1 overflow-x-hidden overflow-y-auto custom-scrollbar relative p-4 md:p-8 lg:p-10">
            <ErrorBoundary context="DashboardLayout">
              <AnimatePresence mode="wait">
                <m.div
                  key={pathname}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  className="max-w-7xl mx-auto min-h-full"
                >
                  {children}
                </m.div>
              </AnimatePresence>
            </ErrorBoundary>
          </main>

        </div>
        
        {/* ═══ SECTION 4: GLOBAL SEARCH EXPERIENCE (Spotlight Overlay) ═══ */}
        <AnimatePresence>
          {isSearchOpen && (
            <>
              <m.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="fixed inset-0 bg-[#02040a]/80 backdrop-blur-md z-[100]"
                onClick={() => setIsSearchOpen(false)}
              />
              <m.div 
                role="dialog"
                aria-modal="true"
                aria-label="Command Palette"
                initial={{ opacity: 0, scale: 0.95, y: -20 }} 
                animate={{ opacity: 1, scale: 1, y: 0 }} 
                exit={{ opacity: 0, scale: 0.95, y: -20 }}
                transition={{ duration: 0.2 }}
                className="fixed top-[15%] left-1/2 -translate-x-1/2 w-full max-w-2xl bg-surface-1/90 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-[0_0_100px_rgba(0,0,0,0.5)] z-[101] overflow-hidden"
              >
                <div className="flex items-center gap-3 px-6 py-4 border-b border-white/5 bg-[#060816]/50">
                  <Search className="w-5 h-5 text-brand-blue" />
                  <input 
                    type="text" 
                    placeholder="Search your wardrobe, outfits, or settings..." 
                    className="flex-1 bg-transparent border-none text-white text-lg focus:outline-none focus:ring-0 placeholder:text-slate-500"
                    autoFocus
                  />
                  <div className="text-[10px] font-label-md text-slate-500 bg-surface-2 px-2 py-1 rounded border border-white/5 uppercase tracking-widest">
                    Esc to close
                  </div>
                </div>
                <div className="p-12 text-center">
                  <div className="w-16 h-16 bg-surface-2 rounded-2xl mx-auto flex items-center justify-center mb-4 border border-white/5">
                    <Search className="w-8 h-8 text-slate-500" />
                  </div>
                  <h3 className="text-lg font-medium text-white mb-1">Global Search</h3>
                  <p className="text-sm text-slate-400">Search logic will be connected in a future production phase.</p>
                </div>
              </m.div>
            </>
          )}
        </AnimatePresence>

      </div>
    </AuthGuard>
  );
}
