/**
 * Smart Wardrobe AI — CTA Section
 *
 * Final call-to-action section with:
 * - Compelling headline
 * - Description text
 * - Primary CTA button
 * - Decorative glow background
 * - "How it works" steps preview
 */

import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";

const steps = [
  {
    step: "01",
    title: "Upload",
    description: "Take a photo or upload images of your clothing items.",
  },
  {
    step: "02",
    title: "Analyze",
    description: "AI identifies colors, patterns, materials, and categories.",
  },
  {
    step: "03",
    title: "Recommend",
    description: "Get smart outfit suggestions tailored to your day.",
  },
];

export default function CTASection() {
  return (
    <section className="relative py-20 sm:py-32" id="cta">
      {/* Background glow */}
      <div className="absolute inset-0 bg-glow-blue pointer-events-none" />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* How it works */}
        <div className="mb-20" id="how-it-works">
          <div className="text-center mb-12">
            <Badge variant="cyan" dot className="mb-4 inline-flex">
              How It Works
            </Badge>
            <h2 className="text-[clamp(24px,4vw,35px)] font-medium text-porcelain leading-[1.2] tracking-[-0.025em]">
              Three simple steps
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            {steps.map((item, index) => (
              <Card
                key={item.step}
                variant="basic"
                hover
                className={`p-6 text-center group animate-fade-in-delay-${Math.min(index + 1, 4)}`}
              >
                {/* Step number */}
                <span className="inline-block text-[32px] font-medium text-cyber-cyan/20 group-hover:text-cyber-cyan/40 transition-colors duration-300 font-[family-name:var(--font-mono)] leading-none mb-4">
                  {item.step}
                </span>

                <h3 className="text-[18px] font-medium text-porcelain mb-2">
                  {item.title}
                </h3>
                <p className="text-[14px] text-cloudburst leading-[1.5]">
                  {item.description}
                </p>

                {/* Connector line (hidden on last card and mobile) */}
                {index < steps.length - 1 && (
                  <div className="hidden sm:block absolute top-1/2 -right-3 w-6 h-[1px] bg-starlight/20" />
                )}
              </Card>
            ))}
          </div>
        </div>

        {/* Main CTA Block */}
        <Card
          variant="translucent"
          className="p-8 sm:p-12 text-center relative overflow-hidden"
        >
          {/* Glow behind CTA */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] h-[200px] rounded-full bg-[radial-gradient(ellipse,rgba(82,225,254,0.06)_0%,transparent_70%)] pointer-events-none" />

          <div className="relative">
            <Badge variant="cyan" className="mb-4 inline-flex">
              Start Today
            </Badge>
            <h2 className="text-[clamp(24px,4vw,35px)] font-medium text-porcelain leading-[1.2] tracking-[-0.025em] max-w-2xl mx-auto">
              Ready to transform your{" "}
              <span className="text-cyber-cyan">wardrobe experience</span>?
            </h2>
            <p className="mt-4 text-[16px] text-cloudburst max-w-lg mx-auto leading-[1.5]">
              Join Smart Wardrobe AI and let artificial intelligence take the
              guesswork out of getting dressed. Free to start, powerful when you
              need it.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button variant="filled" size="lg" className="min-w-[200px]">
                Create Free Account
              </Button>
              <Button variant="ghost" size="lg">
                View Demo
              </Button>
            </div>

            {/* Trust signals */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-[12px] text-muted">
              <span className="flex items-center gap-1.5">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-emerald-400">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
                No credit card required
              </span>
              <span className="flex items-center gap-1.5">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-emerald-400">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
                Private & Secure
              </span>
              <span className="flex items-center gap-1.5">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-emerald-400">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
                AI-Powered
              </span>
            </div>
          </div>
        </Card>
      </div>
    </section>
  );
}
