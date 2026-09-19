import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Playfair_Display } from "next/font/google";
import { Providers } from "@/components/Providers";
import { MobileDock } from "@/components/MobileDock";
import { GlobalNav } from "@/components/GlobalNav";
import "./globals.css";

const jakartaSans = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "FoMo — Discover the Vibe",
  description: "Curated social venue discovery and verified group experiences on Monad",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/logo.png" },
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
    ],
    shortcut: "/logo.png",
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${jakartaSans.variable} ${playfair.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col pb-20 md:pb-0 font-sans bg-[#faf8f5] text-[#1a1a1a]">
        <Providers>
          <GlobalNav />
          {children}
          <MobileDock />
        </Providers>
      </body>
    </html>
  );
}

