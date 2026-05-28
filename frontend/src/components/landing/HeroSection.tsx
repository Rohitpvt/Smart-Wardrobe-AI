/**
 * Smart Wardrobe AI — Hero Section
 *
 * Premium hero section with:
 * - Large display headline with tight letter spacing
 * - Descriptive subtitle in muted text
 * - CTA buttons (filled + ghost)
 * - Subtle blue radial glow background
 * - Staggered entrance animations
 * - Floating decorative elements
 */

import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";

export default function HeroSection() {
  return (
    <section
      className="relative overflow-hidden min-h-[calc(100vh-64px)] flex items-center"
      id="hero"
    >
      {/* Background glow effects */}
      <div className="absolute inset-0 bg-glow-blue pointer-events-none" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-[radial-gradient(circle,rgba(82,225,254,0.03)_0%,transparent_70%)] pointer-events-none" />

      {/* Grid pattern overlay — very subtle */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.02]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
        }}
      />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-32 text-center">
        {/* AI Badge */}
        <div className="animate-fade-in-up mb-6">
          <Badge variant="cyan" dot className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyber-cyan/5 border border-cyber-cyan/10">
            AI-Powered Fashion Intelligence
          </Badge>
        </div>

        {/* Main Headline */}
        <h1
          className="animate-fade-in-delay-1 text-[clamp(36px,6vw,68px)] font-medium text-porcelain leading-[0.94] tracking-[-0.05em] max-w-4xl mx-auto"
        >
          Your{" "}
          <span className="relative">
            <span className="text-cyber-cyan">Smart</span>
            {/* Underline glow effect */}
            <span className="absolute -bottom-1 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyber-cyan/40 to-transparent" />
          </span>{" "}
          Wardrobe,{" "}
          <br className="hidden sm:block" />
          Powered by AI
        </h1>

        {/* Subtitle */}
        <p className="animate-fade-in-delay-2 mt-6 sm:mt-8 text-[clamp(16px,2vw,18px)] leading-[1.56] text-cloudburst max-w-2xl mx-auto">
          Upload your clothing, let AI analyze every piece, and receive
          personalized outfit recommendations based on weather, occasion,
          and your unique style.
        </p>

        {/* CTA Buttons */}
        <div className="animate-fade-in-delay-3 mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button variant="filled" size="lg" className="min-w-[180px]">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M5 12h14" />
              <path d="M12 5l7 7-7 7" />
            </svg>
            Get Started Free
          </Button>
          <Button variant="ghost-cyan" size="lg">
            See How It Works
          </Button>
        </div>

        {/* Stats row */}
        <div className="animate-fade-in-delay-4 mt-14 sm:mt-20 flex flex-wrap items-center justify-center gap-8 sm:gap-12">
          {[
            { value: "AI", label: "Clothing Analysis" },
            { value: "Smart", label: "Outfit Matching" },
            { value: "Live", label: "Weather Aware" },
          ].map((stat) => (
            <div key={stat.label} className="text-center group">
              <div className="text-[20px] font-medium text-porcelain group-hover:text-cyber-cyan transition-colors duration-300">
                {stat.value}
              </div>
              <div className="mt-1 text-[12px] text-muted uppercase tracking-wider">
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 hidden sm:flex flex-col items-center gap-2 text-muted animate-fade-in-delay-4">
          <span className="text-[11px] uppercase tracking-widest">Scroll</span>
          <div className="w-[1px] h-8 bg-gradient-to-b from-muted/50 to-transparent" />
        </div>
      </div>
    </section>
  );
}
