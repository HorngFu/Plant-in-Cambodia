import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isKeystaticEnabled } from "@/lib/keystatic";
import KeystaticApp from "./keystatic";

export const metadata: Metadata = {
  title: "Keystatic · Plant in Cambodia",
  robots: { index: false, follow: false },
};

export default function KeystaticLayout() {
  if (!isKeystaticEnabled()) notFound();

  return (
    <html lang="en">
      <body>
        <KeystaticApp />
      </body>
    </html>
  );
}
