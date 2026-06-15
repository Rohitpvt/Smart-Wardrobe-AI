"use client";

import { useEffect, useState } from "react";
import { Search } from "lucide-react";

interface SearchBarProps {
  onSearch: (query: string) => void;
  defaultValue?: string;
}

export function SearchBar({ onSearch, defaultValue = "" }: SearchBarProps) {
  const [query, setQuery] = useState(defaultValue);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      onSearch(query);
    }, 300);
    return () => clearTimeout(timer);
  }, [query, onSearch]);

  return (
    <div className="relative group">
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-brand-blue transition-colors" />
      <input
        type="text"
        id="wardrobe-search"
        aria-label="Search wardrobe"
        placeholder="Search wardrobe by name, brand, or notes..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full pl-11 pr-4 py-3 rounded-xl border border-white/10 bg-[#060816]/50 backdrop-blur-md text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-brand-blue/50 focus:ring-1 focus:ring-brand-blue/50 transition-all shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)]"
      />
    </div>
  );
}
