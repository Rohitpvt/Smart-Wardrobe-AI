import { useState, useRef, useEffect } from "react";
import { m, AnimatePresence } from "framer-motion";
import { User, Settings, LogOut, Key } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface Props {
  profileData: { first_name: string; last_name: string } | null;
  onLogout: () => void;
}

export function HeaderProfileDropdown({ profileData, onLogout }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleEscape);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Open user menu"
        aria-expanded={isOpen}
        className={cn(
          "w-10 h-10 rounded-xl bg-surface-2 border flex items-center justify-center text-slate-300 transition-all shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue",
          isOpen ? "border-brand-blue/50" : "border-white/10 hover:border-brand-blue/50"
        )}
      >
        {profileData?.first_name ? (
          <span className="font-bold text-sm uppercase">{profileData.first_name[0]}{profileData.last_name?.[0]}</span>
        ) : (
          <User className="w-5 h-5" />
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <m.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-3 w-56 bg-surface-2/95 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.5)] overflow-hidden z-50 origin-top-right"
          >
            <div className="p-4 border-b border-white/10">
              <p className="text-sm font-semibold text-white truncate">
                {profileData?.first_name ? `${profileData.first_name} ${profileData.last_name || ""}` : "User Profile"}
              </p>
            </div>
            
            <div className="p-2 space-y-1">
              <Link href="/settings" onClick={() => setIsOpen(false)}>
                <button className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-slate-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors focus-visible:outline-none focus-visible:bg-white/10">
                  <User className="w-4 h-4" /> Profile
                </button>
              </Link>
              
              <Link href="/settings" onClick={() => setIsOpen(false)}>
                <button className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-slate-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors focus-visible:outline-none focus-visible:bg-white/10">
                  <Settings className="w-4 h-4" /> Settings
                </button>
              </Link>

              <Link href="/settings/ai-access" onClick={() => setIsOpen(false)}>
                <button className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-brand-purple hover:text-brand-purple/80 hover:bg-white/5 rounded-lg transition-colors focus-visible:outline-none focus-visible:bg-white/10">
                  <Key className="w-4 h-4" /> AI Access
                </button>
              </Link>
            </div>

            <div className="p-2 border-t border-white/10">
              <button
                onClick={() => {
                  setIsOpen(false);
                  onLogout();
                }}
                className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors focus-visible:outline-none focus-visible:bg-red-500/20"
              >
                <LogOut className="w-4 h-4" /> Sign Out
              </button>
            </div>
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );
}
