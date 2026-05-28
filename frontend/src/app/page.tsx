/**
 * Smart Wardrobe AI — Landing Page
 *
 * Public landing page composed of:
 * - Navbar (sticky top navigation)
 * - HeroSection (main headline + CTA)
 * - FeaturesSection (4 feature cards)
 * - CTASection (how it works + final CTA)
 * - Footer (minimal)
 */

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import HeroSection from "@/components/landing/HeroSection";
import FeaturesSection from "@/components/landing/FeaturesSection";
import CTASection from "@/components/landing/CTASection";

export default function LandingPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <HeroSection />
        <FeaturesSection />
        <CTASection />
      </main>
      <Footer />
    </>
  );
}
