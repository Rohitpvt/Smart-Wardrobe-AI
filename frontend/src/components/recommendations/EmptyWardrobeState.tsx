import Link from "next/link";
import { Sparkles, Shirt } from "lucide-react";
import { m } from "framer-motion";

interface EmptyWardrobeStateProps {
  message?: string;
}

export function EmptyWardrobeState({ message = "Your AI Stylist is Ready" }: EmptyWardrobeStateProps) {
  return (
    <m.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-24 px-6 bg-surface-1/70 backdrop-blur-xl rounded-2xl border border-white/10 text-center relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-brand-blue/15 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-brand-purple/15 to-transparent rounded-full blur-3xl translate-y-1/2 -translate-x-1/4 pointer-events-none" />

      <div className="w-20 h-20 mb-6 rounded-2xl bg-brand-blue/10 flex items-center justify-center border border-white/5 relative group">
        <div className="absolute -top-2 -right-2 text-brand-purple animate-pulse">
          <Sparkles className="w-6 h-6" />
        </div>
        <Shirt className="w-10 h-10 text-brand-blue/60 group-hover:scale-110 transition-transform duration-500" />
      </div>
      
      <h2 className="text-2xl font-bold mb-3 text-white tracking-tight">{message}</h2>
      <p className="text-slate-400 mb-8 max-w-md leading-relaxed">
        Upload clothing items to your digital wardrobe to unlock personalized AI outfit recommendations tailored to your style and the weather.
      </p>
      
      <Link 
        href="/wardrobe/upload" 
        className="ds-btn-primary px-8 py-3.5 shadow-[0_0_30px_rgba(59,130,246,0.3)] hover:shadow-[0_0_40px_rgba(59,130,246,0.5)] transition-all"
      >
        Upload First Item
      </Link>
    </m.div>
  );
}
