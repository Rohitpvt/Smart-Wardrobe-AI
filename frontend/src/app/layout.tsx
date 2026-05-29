import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/hooks/useAuth";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Smart Wardrobe AI | Midnight Fashion Intelligence",
  description: "AI-powered wardrobe management and intelligent styling recommendations based on weather, occasion, and style.",
  keywords: ["Wardrobe AI", "Fashion", "Outfit Recommender", "Smart Wardrobe"],
  openGraph: {
    title: "Smart Wardrobe AI",
    description: "Your intelligent personal stylist and digital wardrobe.",
    type: "website",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${inter.className} bg-charcoal text-porcelain min-h-screen flex flex-col antialiased selection:bg-cyber-cyan/30 selection:text-porcelain`}
      >
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
