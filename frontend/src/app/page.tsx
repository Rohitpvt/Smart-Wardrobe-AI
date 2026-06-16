"use client";

import Link from "next/link";
import { m, Variants } from "framer-motion";
import { 
  Sparkles, Shirt, CloudRain, BarChart3, UploadCloud, 
  Layers, Wand2, Eye, Cpu, Network, ArrowRight, Zap, Combine, Settings2
} from "lucide-react";
import { useEffect, useState } from "react";

import { fadeUp, staggerContainer, useCountUp } from "@/lib/animations";
import { AmbientGlow } from "@/components/ui/AmbientGlow";
import { SmartWardrobeLogo } from "@/components/branding/smart-wardrobe-logo";

function AnimatedCounter({ value, suffix = "" }: { value: number, suffix?: string }) {
  const count = useCountUp(value);
  return <>{count}{suffix}</>;
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#02040a] font-sans selection:bg-brand-blue/30 selection:text-white overflow-x-hidden">
      
      {/* ═══ AMBIENT GLOW SYSTEM ═══ */}
      <AmbientGlow />

      {/* ═══ NAVIGATION ═══ */}
      <nav className="fixed top-0 left-0 w-full z-50 border-b border-white/5 bg-[#02040a]/60 backdrop-blur-2xl">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="inline-block hover:opacity-90 transition-opacity">
            <SmartWardrobeLogo variant="full" />
          </Link>
          <div className="flex items-center gap-6">
            <Link href="/login" className="text-sm font-medium text-slate-400 hover:text-white transition-colors hidden sm:block">
              Sign In
            </Link>
            <Link href="/register" className="ds-btn-primary px-6 py-2.5 text-sm shadow-[0_0_20px_rgba(59,130,246,0.3)]">
              Start Free
            </Link>
          </div>
        </div>
      </nav>

      <main className="relative z-10 pt-32 flex flex-col items-center">
        
        {/* ═══ SECTION 1: HERO EXPERIENCE ═══ */}
        <section className="w-full max-w-7xl mx-auto px-6 pt-16 md:pt-32 pb-24 md:pb-40 flex flex-col items-center text-center">
          <m.div initial="hidden" animate="visible" variants={staggerContainer} className="flex flex-col items-center max-w-4xl">
            <m.div variants={fadeUp} className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-surface-2/80 border border-white/10 mb-8 backdrop-blur-md shadow-[0_0_30px_rgba(59,130,246,0.1)]">
              <span className="flex h-2 w-2 rounded-full bg-brand-blue shadow-[0_0_8px_rgba(59,130,246,0.8)] animate-pulse" />
              <span className="text-xs font-label-md text-slate-300 uppercase tracking-widest">Fashion Intelligence Engine V2</span>
            </m.div>
            
            <m.h1 variants={fadeUp} className="text-5xl md:text-7xl lg:text-[5rem] font-bold tracking-tight text-white mb-8 leading-[1.05]">
              Your Personal AI Stylist. <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-blue via-brand-purple to-brand-blue bg-[length:200%_auto] animate-gradient">
                Powered by Computer Vision.
              </span>
            </m.h1>
            
            <m.p variants={fadeUp} className="text-lg md:text-2xl text-slate-400 mb-12 max-w-2xl leading-relaxed">
              Digitize your wardrobe in seconds. Our engine automatically categorizes your clothing and generates weather-aware, editorial-quality outfits tailored precisely to you.
            </m.p>
            
            <m.div variants={fadeUp} className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
              <Link href="/register" className="ds-btn-primary px-8 py-4 text-base w-full sm:w-auto group flex items-center justify-center gap-2">
                Get Started <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link href="#features" className="ds-btn-secondary px-8 py-4 text-base w-full sm:w-auto border-white/10 hover:border-white/20 hover:bg-surface-2 transition-all">
                Explore Features
              </Link>
            </m.div>
          </m.div>
        </section>

        {/* ═══ SECTION 6: APPLICATION PREVIEW ═══ */}
        <section className="w-full max-w-6xl mx-auto px-6 pb-40">
          <m.div 
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="rounded-[2.5rem] p-4 md:p-6 bg-surface-1/40 backdrop-blur-3xl border border-white/10 shadow-[0_0_100px_rgba(59,130,246,0.1)] relative overflow-hidden"
          >
             <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-px bg-gradient-to-r from-transparent via-brand-blue/50 to-transparent" />
             
             {/* Mock Dashboard UI */}
             <div className="bg-[#060816] rounded-3xl overflow-hidden border border-white/5 flex flex-col h-[500px] md:h-[700px] shadow-2xl relative">
               {/* Browser Chrome */}
               <div className="h-12 border-b border-white/5 bg-surface-1/50 flex items-center px-6 gap-2">
                 <div className="flex gap-2">
                   <div className="w-3 h-3 rounded-full bg-slate-700 hover:bg-red-500 transition-colors" />
                   <div className="w-3 h-3 rounded-full bg-slate-700 hover:bg-yellow-500 transition-colors" />
                   <div className="w-3 h-3 rounded-full bg-slate-700 hover:bg-green-500 transition-colors" />
                 </div>
               </div>
               
               {/* Dashboard Content */}
               <div className="flex flex-1 p-6 gap-6">
                 {/* Sidebar Mock */}
                 <div className="hidden md:flex flex-col gap-4 w-56 pr-6 border-r border-white/5">
                   <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-brand-blue to-brand-purple mb-6" />
                   {[...Array(5)].map((_, i) => (
                     <div key={i} className={`h-10 rounded-xl w-full ${i === 1 ? 'bg-brand-blue/10 border border-brand-blue/20' : 'bg-surface-2 border border-transparent'}`} />
                   ))}
                 </div>
                 
                 {/* Main Area Mock */}
                 <div className="flex-1 flex flex-col gap-6">
                   {/* Header Row */}
                   <div className="flex justify-between items-center h-12">
                     <div className="h-6 w-48 bg-surface-2 rounded-md" />
                     <div className="flex gap-3">
                       <div className="h-10 w-10 bg-surface-2 rounded-xl" />
                       <div className="h-10 w-32 bg-brand-blue/20 rounded-xl border border-brand-blue/30" />
                     </div>
                   </div>
                   
                   {/* KPI Row */}
                   <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                     {[...Array(4)].map((_, i) => (
                       <div key={i} className="h-28 rounded-2xl bg-surface-2/50 border border-white/5 p-4 flex flex-col justify-between">
                         <div className="h-8 w-8 rounded-lg bg-surface-3" />
                         <div className="h-4 w-1/2 bg-surface-3 rounded" />
                       </div>
                     ))}
                   </div>
                   
                   {/* Grid Row */}
                   <div className="flex-1 grid grid-cols-2 md:grid-cols-3 gap-4">
                     {[...Array(6)].map((_, i) => (
                       <div key={i} className="rounded-2xl bg-surface-2/30 border border-white/5 p-2 flex flex-col">
                         <div className="flex-1 bg-surface-3 rounded-xl mb-3" />
                         <div className="h-3 w-2/3 bg-surface-3 rounded mb-2" />
                         <div className="h-2 w-1/3 bg-surface-3/50 rounded" />
                       </div>
                     ))}
                   </div>
                 </div>
               </div>
               
               {/* Foreground Glow */}
               <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-[#060816] to-transparent pointer-events-none" />
             </div>
          </m.div>
        </section>

        {/* ═══ SECTION 2 & 3: FEATURE GRID ═══ */}
        <section id="features" className="w-full max-w-7xl mx-auto px-6 pb-32">
          <div className="text-center mb-20">
             <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-purple/10 border border-brand-purple/20 text-brand-purple mb-6">
               <Layers className="w-4 h-4" />
               <span className="text-xs font-label-md uppercase tracking-widest font-semibold">Core Capabilities</span>
             </div>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-6">Everything you need to digitize your style.</h2>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">A complete suite of intelligence tools designed to organize, analyze, and optimize your clothing collection.</p>
          </div>
          
          <m.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {[
              { title: "AI Image Extraction", desc: "Instantly removes backgrounds and crops subject clothing automatically upon upload.", icon: Eye },
              { title: "Smart Categorization", desc: "Vision models detect the item type, color family, and season without manual data entry.", icon: Cpu },
              { title: "Outfit Generation", desc: "Synthesizes thousands of permutations to build cohesive, editorial-quality looks.", icon: Wand2 },
              { title: "Weather Intelligence", desc: "Recommendations are strictly calibrated against real-time local environmental conditions.", icon: CloudRain },
              { title: "Wardrobe Analytics", desc: "Unlock deep insights into your color distribution, category gaps, and seasonal readiness.", icon: BarChart3 },
              { title: "Personalization", desc: "The engine adapts over time, learning your specific aesthetic preferences and exclusions.", icon: Settings2 }
            ].map((feature, i) => (
              <m.div key={i} variants={fadeUp} className="group p-8 rounded-3xl bg-surface-1/40 backdrop-blur-xl border border-white/5 hover:border-white/10 hover:bg-surface-1/60 transition-all duration-500 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-brand-blue/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative z-10">
                  <div className="w-12 h-12 rounded-xl bg-surface-2 border border-white/10 flex items-center justify-center mb-6 text-brand-blue group-hover:scale-110 group-hover:bg-brand-blue/10 group-hover:border-brand-blue/20 transition-all duration-300">
                    <feature.icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3 tracking-tight">{feature.title}</h3>
                  <p className="text-slate-400 leading-relaxed text-sm">{feature.desc}</p>
                </div>
              </m.div>
            ))}
          </m.div>
        </section>

        {/* ═══ SECTION 4: AI INTELLIGENCE DEEP DIVE ═══ */}
        <section className="w-full max-w-7xl mx-auto px-6 pb-32">
          <m.div 
             initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer}
             className="rounded-[2.5rem] bg-gradient-to-br from-surface-1/80 to-surface-1/30 backdrop-blur-2xl border border-white/10 p-8 md:p-16 lg:p-20 relative overflow-hidden"
          >
             <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-brand-purple/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3 pointer-events-none" />
             
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 relative z-10">
                <div className="flex flex-col justify-center">
                   <m.div variants={fadeUp} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-purple/10 border border-brand-purple/20 text-brand-purple mb-6">
                     <Zap className="w-4 h-4" />
                     <span className="text-xs font-label-md uppercase tracking-widest font-semibold">Engine Architecture</span>
                   </m.div>
                   <m.h2 variants={fadeUp} className="text-3xl md:text-5xl font-bold text-white mb-6 tracking-tight leading-tight">
                     Built on advanced Computer Vision.
                   </m.h2>
                   <m.p variants={fadeUp} className="text-lg text-slate-400 mb-8 leading-relaxed">
                     Our pipeline processes every image through custom neural networks, extracting complex metadata—like texture, occasion suitability, and color theory—in milliseconds.
                   </m.p>
                   
                   <m.div variants={staggerContainer} className="space-y-6">
                     {[
                       { title: "Metadata Extraction", icon: Combine },
                       { title: "Recommendation Engine", icon: Network },
                       { title: "Weather Integration API", icon: CloudRain }
                     ].map((item, i) => (
                       <m.div key={i} variants={fadeUp} className="flex items-center gap-4">
                         <div className="w-10 h-10 rounded-lg bg-surface-2 flex items-center justify-center border border-white/5 shrink-0">
                           <item.icon className="w-5 h-5 text-brand-blue" />
                         </div>
                         <span className="text-white font-medium">{item.title}</span>
                       </m.div>
                     ))}
                   </m.div>
                </div>
                
                {/* Visual Abstraction of AI */}
                <m.div variants={fadeUp} className="relative h-[400px] lg:h-auto rounded-3xl bg-[#060816] border border-white/10 overflow-hidden flex items-center justify-center shadow-2xl">
                   <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20" />
                   <div className="relative z-10 grid grid-cols-3 gap-4 w-full px-8">
                     {/* Floating Mock Data Nodes */}
                     <div className="col-span-1 space-y-4 translate-y-8 animate-[bounce_8s_infinite]">
                        <div className="h-20 bg-surface-2 rounded-xl border border-white/10 p-3 flex flex-col justify-end"><div className="h-2 w-1/2 bg-brand-blue/50 rounded" /></div>
                        <div className="h-32 bg-surface-2 rounded-xl border border-white/10 p-3 flex flex-col justify-end"><div className="h-2 w-3/4 bg-brand-purple/50 rounded" /></div>
                     </div>
                     <div className="col-span-1 space-y-4 -translate-y-4 animate-[bounce_6s_infinite_reverse]">
                        <div className="h-32 bg-surface-2 rounded-xl border border-white/10 flex items-center justify-center"><Network className="w-8 h-8 text-slate-600" /></div>
                        <div className="h-24 bg-surface-2 rounded-xl border border-white/10 p-3 flex flex-col justify-end"><div className="h-2 w-full bg-brand-blue/50 rounded" /></div>
                     </div>
                     <div className="col-span-1 space-y-4 translate-y-4 animate-[bounce_7s_infinite]">
                        <div className="h-24 bg-surface-2 rounded-xl border border-white/10 p-3 flex flex-col justify-end"><div className="h-2 w-2/3 bg-brand-purple/50 rounded" /></div>
                        <div className="h-20 bg-surface-2 rounded-xl border border-white/10 p-3 flex flex-col justify-end"><div className="h-2 w-1/3 bg-brand-blue/50 rounded" /></div>
                     </div>
                   </div>
                </m.div>
             </div>
          </m.div>
        </section>

        {/* ═══ SECTION 5: SOCIAL PROOF / METRICS ═══ */}
        <section className="w-full border-y border-white/5 bg-surface-1/20 py-24 mb-32 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(59,130,246,0.05),transparent_70%)]" />
          <div className="max-w-7xl mx-auto px-6 relative z-10">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 divide-y sm:divide-y-0 sm:divide-x divide-white/5 text-center">
              {[
                { metric: 12500, suffix: "+", label: "Items Digitized" },
                { metric: 8400, suffix: "+", label: "Outfits Generated" },
                { metric: 98, suffix: "%", label: "AI Confidence Avg" },
                { metric: 24, suffix: "/7", label: "Weather Sync active" }
              ].map((stat, i) => (
                <div key={i} className="flex flex-col items-center justify-center pt-8 sm:pt-0 first:pt-0">
                  <h4 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60 mb-3 tracking-tight">
                    <AnimatedCounter value={stat.metric} suffix={stat.suffix} />
                  </h4>
                  <p className="text-sm font-label-md uppercase tracking-widest text-slate-500">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ SECTION 7: CONVERSION CTA ═══ */}
        <section className="w-full max-w-5xl mx-auto px-6 pb-40 text-center">
          <m.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="rounded-[3rem] p-12 md:p-24 flex flex-col items-center relative overflow-hidden bg-surface-1/80 border border-white/10 shadow-2xl backdrop-blur-xl group"
          >
            <div className="absolute inset-0 bg-gradient-to-b from-brand-blue/10 to-transparent opacity-50" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-1 bg-gradient-to-r from-transparent via-brand-blue to-transparent group-hover:w-3/4 transition-all duration-700" />
            
            <h2 className="text-4xl md:text-6xl font-bold tracking-tight text-white mb-6 leading-tight relative z-10">
              Transform your wardrobe into intelligence.
            </h2>
            <p className="text-lg md:text-xl text-slate-400 mb-10 max-w-2xl relative z-10">
              Join the platform that treats your closet like a highly structured, queryable, and dynamically styled database.
            </p>
            <Link href="/register" className="ds-btn-primary px-10 py-5 text-lg shadow-[0_0_50px_-10px_rgba(59,130,246,0.6)] relative z-10 group/btn flex items-center gap-3">
              Start Free Trial <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
            </Link>
          </m.div>
        </section>
      </main>
      
      {/* ═══ SECTION 8: FOOTER ═══ */}
      <footer className="w-full border-t border-white/5 bg-[#02040a] pt-16 pb-8 relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-16">
            <div className="col-span-2 md:col-span-2">
              <Link href="/" className="inline-block mb-6 hover:opacity-90 transition-opacity">
                <SmartWardrobeLogo variant="full" />
              </Link>
              <p className="text-slate-400 text-sm max-w-xs leading-relaxed">
                The most advanced fashion intelligence platform. Organize, analyze, and automate your personal style.
              </p>
            </div>
            
            <div>
              <h4 className="text-white font-medium mb-4">Product</h4>
              <ul className="space-y-3 text-sm text-slate-500">
                <li><Link href="#features" className="hover:text-white transition-colors">Features</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Integrations</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Pricing</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-medium mb-4">Technology</h4>
              <ul className="space-y-3 text-sm text-slate-500">
                <li><Link href="#" className="hover:text-white transition-colors">Computer Vision</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Recommendation API</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Security</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-medium mb-4">Account</h4>
              <ul className="space-y-3 text-sm text-slate-500">
                <li><Link href="/login" className="hover:text-white transition-colors">Sign In</Link></li>
                <li><Link href="/register" className="hover:text-white transition-colors">Create Account</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-slate-600 text-sm">
              &copy; {new Date().getFullYear()} Smart Wardrobe AI. All rights reserved.
            </p>
            <div className="flex gap-6 text-sm text-slate-600">
              <Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link>
              <Link href="#" className="hover:text-white transition-colors">Terms of Service</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
