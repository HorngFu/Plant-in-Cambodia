import { Kantumruy_Pro } from "next/font/google";

// Kantumruy Pro covers both Khmer and Latin, so one family serves both languages. next/font adds a
// size-matched fallback, so the swap causes no layout shift.
export const kantumruy = Kantumruy_Pro({
  variable: "--font-kantumruy",
  subsets: ["khmer", "latin"],
  display: "swap",
});
