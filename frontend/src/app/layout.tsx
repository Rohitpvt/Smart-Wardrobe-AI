import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/hooks/useAuth";
import { ToastProvider } from "@/hooks/useToast";
import { ToastContainer } from "@/components/ui/ToastContainer";

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
      <body className={inter.className}>
        <AuthProvider>
          <ToastProvider>
            {children}
            <ToastContainer />
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
