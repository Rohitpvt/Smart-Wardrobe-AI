import { m } from "framer-motion";
import { staggerContainer, fadeUp } from "@/lib/animations";
import { useIntelligenceDashboard } from "@/hooks/use-intelligence";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { WidgetSkeleton } from "@/components/ui/skeleton-loaders";
import { Bell, Sparkles, CloudSun, Activity, RefreshCw, BrainCircuit, ArrowUpRight, UploadCloud, LucideIcon } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface InfoCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  color: { bg: string; text: string };
  status: string;
  cta: string;
  href: string;
}

function InfoCard({ title, description, icon: Icon, color, status, cta, href }: InfoCardProps) {
  return (
    <m.div variants={fadeUp} className="bg-surface-2/40 border border-white/5 hover:border-white/20 hover:bg-surface-2/60 transition-all duration-300 rounded-2xl p-6 flex flex-col h-full relative overflow-hidden group">
      {/* Subtle Background Glow */}
      <div className={cn("absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-0 group-hover:opacity-20 transition-opacity duration-500 -translate-y-1/2 translate-x-1/2", color.bg.replace('/10', ''))} />
      
      <div className="flex items-start justify-between mb-5 relative z-10">
        <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center border border-white/10", color.bg, color.text)}>
          <Icon className="w-6 h-6" />
        </div>
        {status && (
          <span className="text-[10px] uppercase tracking-wider font-semibold px-2.5 py-1 bg-white/5 text-white/70 rounded-full border border-white/10 shadow-sm">
            {status}
          </span>
        )}
      </div>
      <h3 className="text-lg font-semibold text-white mb-2 relative z-10">{title}</h3>
      <p className="text-sm text-white/50 mb-8 flex-1 leading-relaxed relative z-10">{description}</p>
      
      <Link href={href} className="relative z-10 inline-block w-fit">
        <div className="flex items-center text-sm font-medium text-white/60 group-hover:text-white transition-colors">
          {cta} <ArrowUpRight className="w-4 h-4 ml-1 opacity-50 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
        </div>
      </Link>
    </m.div>
  );
}

export function WardrobeIntelligenceCenter() {
  const { data, isLoading, isError } = useIntelligenceDashboard();

  if (isLoading) {
    return (
      <GlassPanel className="p-8 border border-brand-purple/20 relative overflow-hidden group">
        <div className="flex items-center justify-center py-6">
          <WidgetSkeleton />
        </div>
      </GlassPanel>
    );
  }

  if (isError || !data) {
    return null;
  }

  const feed = data.feed ?? [];
  const opportunities = data.opportunities ?? [];
  const weekly_report = data.weekly_report ?? null;

  const hasContent = feed.length > 0 || opportunities.length > 0 || !!weekly_report;

  if (!hasContent) {
    return (
      <div className="mb-12">
        <div className="mb-6">
          <h2 className="text-2xl font-bold tracking-tight text-white mb-1">Wardrobe Intelligence Center</h2>
          <p className="text-sm text-slate-400">Proactive insights, opportunities, and AI coaching based on your wardrobe activity.</p>
        </div>
        <GlassPanel className="p-16 text-center border border-white/5 flex flex-col items-center justify-center">
          <div className="w-20 h-20 bg-brand-purple/10 border border-brand-purple/20 rounded-full flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(168,85,247,0.15)]">
            <BrainCircuit className="w-10 h-10 text-brand-purple" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-3 tracking-tight">Your intelligence feed is warming up</h3>
          <p className="text-white/50 max-w-md mx-auto mb-8 text-base">Add more wardrobe items and use AI Stylist to unlock deeper wardrobe insights.</p>
          <Link href="/wardrobe">
            <button className="bg-white text-black px-6 py-3 rounded-full font-semibold hover:bg-white/90 transition-all hover:scale-105 active:scale-95 flex items-center gap-2 shadow-lg">
              <UploadCloud className="w-5 h-5" />
              Upload Clothing
            </button>
          </Link>
        </GlassPanel>
      </div>
    );
  }

  const alerts = feed.filter(f => f.item_type === "alert");
  const alertCount = alerts.length;
  const oppCount = opportunities.length;

  const cards = [
    {
      title: "Risk Alerts",
      description: "High-priority wardrobe gaps, wear-and-tear, or neglected items.",
      icon: Bell,
      color: { bg: "bg-red-400/10", text: "text-red-400" },
      status: alertCount > 0 ? `${alertCount} Active` : "All Good",
      cta: alertCount > 0 ? "Review Alerts" : "View Details",
      href: "/intelligence"
    },
    {
      title: "Style Opportunities",
      description: "AI-identified outfit upgrades and pairing suggestions.",
      icon: Sparkles,
      color: { bg: "bg-amber-400/10", text: "text-amber-400" },
      status: oppCount > 0 ? `${oppCount} Found` : "Scanning...",
      cta: oppCount > 0 ? "Explore Opportunities" : "View Details",
      href: "/shopping-intelligence"
    },
    {
      title: "Seasonal Readiness",
      description: "How prepared your current closet is for upcoming weather changes.",
      icon: CloudSun,
      color: { bg: "bg-blue-400/10", text: "text-blue-400" },
      status: "Analyzing",
      cta: "Improve",
      href: "/wardrobe"
    },
    {
      title: "Wardrobe Health",
      description: "Overall quality, versatility, and diversity score of your closet.",
      icon: Activity,
      color: { bg: "bg-emerald-400/10", text: "text-emerald-400" },
      status: "Optimizing",
      cta: "Review Health",
      href: "/intelligence"
    },
    {
      title: "Rotation Insights",
      description: "Frequency of item wear and average cost-per-wear metrics.",
      icon: RefreshCw,
      color: { bg: "bg-brand-blue/10", text: "text-brand-blue" },
      status: weekly_report?.snapshot_json?.rotation_score ? `${weekly_report.snapshot_json.rotation_score}/100` : "Needs Data",
      cta: "View Insights",
      href: "/intelligence"
    },
    {
      title: "AI Coaching",
      description: "Personalized styling advice and progression milestones.",
      icon: BrainCircuit,
      color: { bg: "bg-brand-purple/10", text: "text-brand-purple" },
      status: weekly_report?.coaching_advice ? "Advice Ready" : "Awaiting Data",
      cta: "Read Coaching",
      href: "/daily-stylist"
    }
  ];

  return (
    <div className="mb-12">
      <div className="mb-8">
        <h2 className="text-2xl font-bold tracking-tight text-white mb-1">Wardrobe Intelligence Center</h2>
        <p className="text-sm text-slate-400">Proactive insights, opportunities, and AI coaching based on your wardrobe activity.</p>
      </div>

      <m.div 
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {cards.map((card, idx) => (
          <InfoCard key={idx} {...card} />
        ))}
      </m.div>
    </div>
  );
}
