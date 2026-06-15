"use client";

import { m } from "framer-motion";
import { Sparkles, Shirt, CloudSun } from "lucide-react";

/**
 * Premium visual panel displayed on the left side of auth pages on desktop.
 * Contains animated mesh gradients, floating decorative cards, and brand identity.
 * Collapses into a compact banner on mobile.
 */
export function AuthVisualPanel() {
  return (
    <div className="relative w-full h-full overflow-hidden bg-background flex flex-col items-center justify-center">
      {/* Animated mesh gradient blobs */}
      <div className="absolute top-[10%] left-[-10%] w-[60%] h-[50%] bg-brand-blue/25 blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[5%] right-[-15%] w-[55%] h-[45%] bg-brand-purple/20 blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute top-[50%] left-[30%] w-[30%] h-[30%] bg-cyan-500/10 blur-[80px] rounded-full pointer-events-none" />

      {/* Floating wardrobe cards */}
      <div className="relative z-10 w-full max-w-md px-8">
        {/* Card 1 — Top Left */}
        <m.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="absolute -top-16 left-4 md:left-8"
        >
          <m.div
            animate={{ y: [0, -8, 0] }}
            transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
            className="bg-surface-2/80 backdrop-blur-md border border-white/10 rounded-2xl p-4 shadow-2xl w-44"
          >
            <div className="w-full h-20 rounded-lg bg-gradient-to-br from-blue-600/20 to-purple-600/20 mb-3 flex items-center justify-center">
              <Shirt className="w-8 h-8 text-blue-400/60" />
            </div>
            <div className="h-2.5 bg-surface-3/60 rounded w-3/4 mb-2" />
            <div className="h-2 bg-surface-3/40 rounded w-1/2" />
          </m.div>
        </m.div>

        {/* Card 2 — Right */}
        <m.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="absolute top-12 right-4 md:right-2"
        >
          <m.div
            animate={{ y: [0, -10, 0] }}
            transition={{ repeat: Infinity, duration: 5, ease: "easeInOut", delay: 1 }}
            className="bg-surface-2/80 backdrop-blur-md border border-white/10 rounded-2xl p-4 shadow-2xl w-48"
          >
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
                <CloudSun className="w-4 h-4 text-emerald-400" />
              </div>
              <div>
                <div className="h-2.5 bg-surface-3/60 rounded w-16 mb-1" />
                <div className="h-2 bg-surface-3/40 rounded w-10" />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div className="h-14 rounded-lg bg-gradient-to-b from-indigo-500/15 to-transparent" />
              <div className="h-14 rounded-lg bg-gradient-to-b from-violet-500/15 to-transparent" />
              <div className="h-14 rounded-lg bg-gradient-to-b from-blue-500/15 to-transparent" />
            </div>
          </m.div>
        </m.div>

        {/* Card 3 — Bottom */}
        <m.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.8 }}
          className="absolute bottom-[-40px] left-1/2 -translate-x-1/2"
        >
          <m.div
            animate={{ y: [0, -6, 0] }}
            transition={{ repeat: Infinity, duration: 4.5, ease: "easeInOut", delay: 0.5 }}
            className="bg-surface-2/80 backdrop-blur-md border border-white/10 rounded-2xl p-4 shadow-2xl w-52"
          >
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <div className="h-2.5 bg-surface-3/60 rounded w-20" />
            </div>
            <div className="flex gap-2">
              <div className="h-3 bg-brand-blue/20 rounded-full px-2 flex-1" />
              <div className="h-3 bg-brand-purple/20 rounded-full px-2 flex-1" />
            </div>
          </m.div>
        </m.div>

        {/* Central brand identity */}
        <m.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="text-center relative z-20 py-20"
        >
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-blue to-brand-purple flex items-center justify-center mx-auto mb-6 shadow-[0_0_40px_rgba(59,130,246,0.3)]">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-3 text-text-primary leading-tight">
            Your AI Stylist.<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-blue to-brand-purple">
              Reimagined.
            </span>
          </h2>
          <p className="text-text-secondary text-base max-w-xs mx-auto leading-relaxed">
            Smart outfit recommendations powered by your wardrobe and weather.
          </p>
        </m.div>
      </div>
    </div>
  );
}
