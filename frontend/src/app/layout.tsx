import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

/**
 * Inter — Primary font from DESIGN.md
 * Loaded via next/font for optimal performance (no layout shift).
 */
const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Smart Wardrobe AI — AI-Powered Clothing Analyzer & Outfit Recommendations",
  description:
    "Upload clothing images, manage your wardrobe, and receive intelligent outfit recommendations powered by AI. Weather-aware, occasion-based, and personalized to your style.",
  keywords: [
    "smart wardrobe",
    "AI fashion",
    "outfit recommendations",
    "clothing analyzer",
    "wardrobe management",
  ],
  authors: [{ name: "Smart Wardrobe AI" }],
  openGraph: {
    title: "Smart Wardrobe AI",
    description:
      "AI-powered clothing analyzer and smart wardrobe management application.",
    type: "website",
    locale: "en_US",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full`}>
      <body className="min-h-full flex flex-col font-[family-name:var(--font-inter)] antialiased">
        {children}
      </body>
    </html>
  );
}
