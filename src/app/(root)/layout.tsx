import type { Metadata } from "next";
import { kantumruy } from "@/app/fonts";
import { SITE_URL } from "@/lib/site";
import "../globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Plant in Cambodia · រុក្ខជាតិនៅកម្ពុជា",
  description: "An open list of the plants of Cambodia, in Khmer and English.",
  alternates: {
    languages: { km: "/km", en: "/en", "x-default": "/en" },
  },
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${kantumruy.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col font-sans">{children}</body>
    </html>
  );
}
