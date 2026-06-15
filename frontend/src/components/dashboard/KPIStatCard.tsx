"use client";

import React, { ElementType } from "react";
import { m } from "framer-motion";
import { fadeUp } from "@/lib/animations";

interface KPIStatCardProps {
  label: string;
  value: string | number;
  icon: ElementType;
  colorClass: string;
  bgClass: string;
}

export function KPIStatCard({ label, value, icon: Icon, colorClass, bgClass }: KPIStatCardProps) {
  return (
    <m.div
      variants={fadeUp}
      className="group rounded-2xl p-6 bg-surface-1/70 backdrop-blur-xl border border-white/10 shadow-[0_0_30px_rgba(59,130,246,0.03)] hover:shadow-[0_0_40px_rgba(59,130,246,0.12)] hover:-translate-y-[2px] hover:border-white/15 transition-all duration-300"
    >
      <div className="flex justify-between items-start mb-6">
        <div className={`h-10 w-10 rounded-xl ${bgClass} flex items-center justify-center ${colorClass} group-hover:scale-110 transition-transform duration-300`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <p className="text-xs font-medium text-slate-400 uppercase tracking-widest mb-1">{label}</p>
      <p className="text-3xl font-bold text-white tracking-tight">{value}</p>
    </m.div>
  );
}
