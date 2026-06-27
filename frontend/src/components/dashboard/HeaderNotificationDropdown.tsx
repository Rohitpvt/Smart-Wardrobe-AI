import { useState, useRef, useEffect } from "react";
import { m, AnimatePresence } from "framer-motion";
import { Bell, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function HeaderNotificationDropdown() {
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
        aria-label="Open notifications"
        aria-expanded={isOpen}
        className={cn(
          "relative p-2.5 rounded-xl border transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue",
          isOpen ? "bg-surface-2 text-white border-brand-blue/50" : "text-slate-400 hover:text-white bg-surface-2 border-white/5 hover:border-white/10"
        )}
      >
        <Bell className="w-5 h-5" />
        <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-brand-purple rounded-full border border-surface-2" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <m.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-3 w-80 sm:w-96 bg-surface-2/95 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.5)] overflow-hidden z-50 origin-top-right"
          >
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
              <h3 className="font-semibold text-white">Notifications</h3>
              <span className="text-xs text-brand-purple bg-brand-purple/10 px-2 py-0.5 rounded-full font-medium">0 New</span>
            </div>
            
            <div className="p-8 flex flex-col items-center justify-center text-center">
              <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-full flex items-center justify-center mb-4">
                <CheckCircle2 className="w-6 h-6 text-white/40" />
              </div>
              <h4 className="text-sm font-semibold text-white mb-1">No new notifications</h4>
              <p className="text-xs text-white/50 leading-relaxed max-w-[200px]">
                You're all caught up. Important wardrobe and AI updates will appear here.
              </p>
            </div>
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );
}
