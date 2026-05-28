/**
 * Smart Wardrobe AI — Features Section
 *
 * Showcases 4 core features in translucent bordered cards:
 * - AI Clothing Analysis
 * - Smart Outfit Recommendations
 * - Wardrobe Management
 * - Weather-Aware Styling
 *
 * Each card has an icon, title, description, and subtle hover effect.
 */

import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";

interface Feature {
  icon: React.ReactNode;
  title: string;
  description: string;
  badge: string;
}

const features: Feature[] = [
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" />
        <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
      </svg>
    ),
    title: "AI Clothing Analysis",
    description:
      "Upload any clothing image and our AI instantly identifies the type, color, pattern, material, and suitable occasions. No manual tagging needed.",
    badge: "Vision AI",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2L2 7l10 5 10-5-10-5z" />
        <path d="M2 17l10 5 10-5" />
        <path d="M2 12l10 5 10-5" />
      </svg>
    ),
    title: "Smart Recommendations",
    description:
      "Get outfit suggestions that consider color harmony, style preferences, season, and occasion. Every recommendation comes with AI reasoning.",
    badge: "ML Engine",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="20" height="18" rx="3" />
        <path d="M2 9h20" />
        <path d="M9 21V9" />
      </svg>
    ),
    title: "Wardrobe Management",
    description:
      "Organize your entire wardrobe digitally. Filter by category, color, season, or occasion. Track what you wear and when.",
    badge: "Organize",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
        <circle cx="12" cy="12" r="4" />
      </svg>
    ),
    title: "Weather-Aware Styling",
    description:
      "Real-time weather data ensures your outfit matches the conditions. Never be caught underdressed for rain or overdressed on a warm day.",
    badge: "Live Data",
  },
];

export default function FeaturesSection() {
  return (
    <section
      className="relative py-20 sm:py-32"
      id="features"
    >
      {/* Subtle background accent */}
      <div className="absolute inset-0 bg-glow-cyan pointer-events-none" />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-14 sm:mb-20">
          <Badge variant="cyan" dot className="mb-4 inline-flex">
            Core Features
          </Badge>
          <h2 className="text-[clamp(24px,4vw,35px)] font-medium text-porcelain leading-[1.2] tracking-[-0.025em]">
            Everything you need for a{" "}
            <span className="text-cyber-cyan">smarter wardrobe</span>
          </h2>
          <p className="mt-4 text-[16px] text-cloudburst max-w-xl mx-auto leading-[1.4]">
            From AI image analysis to weather-aware outfit suggestions,
            we&apos;ve built the tools to transform how you dress every day.
          </p>
        </div>

        {/* Feature grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {features.map((feature, index) => (
            <Card
              key={feature.title}
              variant="translucent"
              hover
              className={`p-6 sm:p-8 group animate-fade-in-delay-${Math.min(index + 1, 4)}`}
            >
              {/* Icon container */}
              <div className="w-10 h-10 rounded-[10px] bg-charcoal flex items-center justify-center text-cyber-cyan mb-5 group-hover:shadow-[0_0_12px_rgba(82,225,254,0.15)] transition-shadow duration-300">
                {feature.icon}
              </div>

              {/* Content */}
              <div className="flex items-start justify-between gap-4 mb-3">
                <h3 className="text-[18px] font-medium text-porcelain leading-[1.33]">
                  {feature.title}
                </h3>
                <Badge variant="default" className="flex-shrink-0 mt-1">
                  {feature.badge}
                </Badge>
              </div>

              <p className="text-[14px] text-cloudburst leading-[1.5]">
                {feature.description}
              </p>

              {/* Bottom accent line */}
              <div className="mt-6 h-[1px] bg-gradient-to-r from-cyber-cyan/20 via-cyber-cyan/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
