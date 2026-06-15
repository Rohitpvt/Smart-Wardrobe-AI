"use client";

import React from "react";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import { m } from "framer-motion";
import { CategoryDistribution, SeasonDistribution } from "@/types/dashboard";
import { fadeUp, staggerContainer as stagger } from "@/lib/animations";

const COLORS = ["#3b82f6", "#8b5cf6", "#adc6ff", "#d0bcff", "#10b981"];

const tooltipStyle = {
  backgroundColor: "rgba(15, 23, 42, 0.9)",
  borderColor: "rgba(255,255,255,0.1)",
  borderRadius: "12px",
  backdropFilter: "blur(12px)",
  color: "#f8fafc",
};

interface DashboardChartsProps {
  data: any;
  trendData: any;
}

export default function DashboardCharts({ data, trendData }: DashboardChartsProps) {
  return (
    <m.section variants={stagger} className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Category Distribution */}
      <m.div variants={fadeUp} className="rounded-2xl p-6 bg-surface-1/70 backdrop-blur-xl border border-white/10">
        <h3 className="text-sm font-medium text-slate-400 uppercase tracking-widest mb-6">Category Distribution</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={data.category_distribution} dataKey="count" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={85} paddingAngle={4} strokeWidth={0}>
                {data.category_distribution.map((entry: CategoryDistribution, index: number) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <RechartsTooltip contentStyle={tooltipStyle} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex flex-wrap gap-3 mt-4">
          {data.category_distribution.slice(0, 4).map((entry: CategoryDistribution, i: number) => (
            <div key={i} className="flex items-center gap-2 text-xs text-slate-400">
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
              {entry.name}
            </div>
          ))}
        </div>
      </m.div>

      {/* Color Distribution */}
      <m.div variants={fadeUp} className="rounded-2xl p-6 bg-surface-1/70 backdrop-blur-xl border border-white/10">
        <h3 className="text-sm font-medium text-slate-400 uppercase tracking-widest mb-6">Color Palette</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.color_distribution} barCategoryGap="20%">
              <XAxis dataKey="name" stroke="#8c909f" fontSize={11} axisLine={false} tickLine={false} />
              <YAxis stroke="#8c909f" fontSize={11} axisLine={false} tickLine={false} allowDecimals={false} />
              <RechartsTooltip cursor={{ fill: "rgba(255,255,255,0.03)" }} contentStyle={tooltipStyle} />
              <Bar dataKey="count" radius={[6, 6, 0, 0]} fill="url(#barGradient)" />
              <defs>
                <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#8b5cf6" />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.6} />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </m.div>

      {/* Season Distribution */}
      <m.div variants={fadeUp} className="rounded-2xl p-6 bg-surface-1/70 backdrop-blur-xl border border-white/10">
        <h3 className="text-sm font-medium text-slate-400 uppercase tracking-widest mb-6">Season Breakdown</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={data.season_distribution} dataKey="count" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={85} paddingAngle={3} strokeWidth={0}>
                {data.season_distribution.map((entry: SeasonDistribution, index: number) => (
                  <Cell key={`cell-${index}`} fill={COLORS[(index + 2) % COLORS.length]} />
                ))}
              </Pie>
              <RechartsTooltip contentStyle={tooltipStyle} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex flex-wrap gap-3 mt-4">
          {data.season_distribution.slice(0, 4).map((entry: SeasonDistribution, i: number) => (
            <div key={i} className="flex items-center gap-2 text-xs text-slate-400">
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[(i + 2) % COLORS.length] }} />
              {entry.name}
            </div>
          ))}
        </div>
      </m.div>

      {/* AI Confidence Trend */}
      <m.div variants={fadeUp} className="rounded-2xl p-6 bg-surface-1/70 backdrop-blur-xl border border-white/10">
        <h3 className="text-sm font-medium text-slate-400 uppercase tracking-widest mb-6">AI Confidence Trend</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trendData || []}>
              <XAxis dataKey="date" stroke="#8c909f" fontSize={11} axisLine={false} tickLine={false} />
              <YAxis stroke="#8c909f" fontSize={11} domain={[0, 100]} axisLine={false} tickLine={false} />
              <RechartsTooltip contentStyle={tooltipStyle} />
              <defs>
                <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#3b82f6" />
                  <stop offset="100%" stopColor="#8b5cf6" />
                </linearGradient>
              </defs>
              <Line type="monotone" dataKey="average_confidence" stroke="url(#lineGradient)" strokeWidth={3} dot={{ fill: "#3b82f6", r: 3, strokeWidth: 0 }} activeDot={{ fill: "#8b5cf6", r: 5, strokeWidth: 2, stroke: "#fff" }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </m.div>
    </m.section>
  );
}
