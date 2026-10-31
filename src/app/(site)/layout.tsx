import type { Metadata } from "next";
import { Kantumruy_Pro } from "next/font/google";
import "../globals.css";

const kantumruy = Kantumruy_Pro({
  variable: "--font-kantumruy",
  subsets: ["khmer", "latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://plantincambodia.org"),
  title: "Plant in Cambodia · រុក្ខជាតិនៅកម្ពុជា",
  description:
    "An open data platform listing the plants of Cambodia, in Khmer and English. Coming soon.",
  robots: { index: false, follow: false },
};

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${kantumruy.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col font-sans">{children}</body>
    </html>
  );
}
