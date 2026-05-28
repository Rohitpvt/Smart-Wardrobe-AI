/**
 * Smart Wardrobe AI — Footer Component
 *
 * Minimal dark footer with:
 * - Brand name
 * - Navigation links
 * - Copyright
 */

import { APP_NAME } from "@/lib/constants";
import Badge from "@/components/ui/Badge";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      className="border-t border-starlight/10 bg-carbon"
      id="footer"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row justify-between items-start gap-8">
          {/* Brand */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-[6px] bg-charcoal flex items-center justify-center shadow-[inset_0_0_0_1px_rgba(82,225,254,0.2)]">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-cyber-cyan"
                >
                  <path d="M12 2L2 7l10 5 10-5-10-5z" />
                  <path d="M2 17l10 5 10-5" />
                  <path d="M2 12l10 5 10-5" />
                </svg>
              </div>
              <span className="text-[14px] font-medium text-porcelain">
                {APP_NAME}
              </span>
            </div>
            <p className="text-[13px] text-muted max-w-xs">
              AI-powered wardrobe management and outfit recommendations.
            </p>
          </div>

          {/* Links */}
          <div className="flex gap-12">
            <div className="space-y-3">
              <h4 className="text-[12px] font-medium text-skyline-gray uppercase tracking-wider">
                Product
              </h4>
              <ul className="space-y-2">
                {["Features", "Pricing", "Changelog"].map((item) => (
                  <li key={item}>
                    <a
                      href="#"
                      className="text-[13px] text-cloudburst hover:text-porcelain transition-colors duration-200"
                    >
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="text-[12px] font-medium text-skyline-gray uppercase tracking-wider">
                Company
              </h4>
              <ul className="space-y-2">
                {["About", "Blog", "Contact"].map((item) => (
                  <li key={item}>
                    <a
                      href="#"
                      className="text-[13px] text-cloudburst hover:text-porcelain transition-colors duration-200"
                    >
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 pt-6 border-t border-starlight/10 flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="text-[12px] text-muted">
            © {currentYear} {APP_NAME}. All rights reserved.
          </p>
          <Badge variant="default" dot>
            Phase 1 — Foundation
          </Badge>
        </div>
      </div>
    </footer>
  );
}
