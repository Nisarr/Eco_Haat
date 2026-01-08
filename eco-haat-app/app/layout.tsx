import type { Metadata, Viewport } from "next";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import "./globals.css";

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#22c55e',
};

export const metadata: Metadata = {
  title: "Eco Haat - Sustainable Marketplace for Eco-Friendly Products",
  description: "Eco Haat - Your eco-friendly marketplace for sustainable, biodegradable products. Shop bamboo, paper, clay, and natural fiber products.",
  keywords: "eco-friendly, sustainable, biodegradable, bamboo, paper products, organic, green marketplace",
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    title: "Eco Haat - Sustainable Marketplace",
    description: "Shop eco-friendly products from verified sustainable sellers",
    type: "website",
    locale: "en_US",
    siteName: "Eco Haat",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="antialiased min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
