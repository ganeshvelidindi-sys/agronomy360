import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AppProvider } from "@/lib/context";
import ScreenRefreshSplash from "@/components/ScreenRefreshSplash";
import OfflineStatusBanner from "@/components/OfflineStatusBanner";

export const metadata: Metadata = {
  title: "AGRONOMY 360 — Direct Farm to Buyer Marketplace",
  description:
    "Connect farmers directly with buyers. No middlemen. Fair prices. AI-powered crop advice, disease detection, loan assistance, and live market prices.",
  keywords: "farmer marketplace, direct farm to buyer, crop selling, agricultural marketplace, India, kisan",
  authors: [{ name: "AGRONOMY 360" }],
  icons: { icon: "/logo.jpg", apple: "/logo.jpg" },
  openGraph: {
    title: "AGRONOMY 360",
    description: "Direct Farmer-to-Buyer Agricultural Marketplace",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#1a5c2a",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-gray-50 antialiased">
        <AppProvider>
          <ScreenRefreshSplash />
          <OfflineStatusBanner />
          {children}
        </AppProvider>
      </body>
    </html>
  );
}
