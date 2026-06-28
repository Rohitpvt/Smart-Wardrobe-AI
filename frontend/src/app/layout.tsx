import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { Providers } from "./providers";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import { Toaster } from 'sonner';

const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-jakarta" });

export const metadata: Metadata = {
  title: "Smart Wardrobe AI",
  description: "AI-powered wardrobe management and outfit recommendations",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
    <html lang="en">
      <body className={`${jakarta.variable} font-sans antialiased`}>
        <Providers>
          {children}
          <Toaster theme="dark" position="bottom-right" richColors />
        </Providers>
      </body>
    </html>
    </ClerkProvider>
  );
}
