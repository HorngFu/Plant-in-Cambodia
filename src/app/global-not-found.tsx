import Link from "next/link";
import type { Metadata } from "next";
import { kantumruy } from "./fonts";
import { LeafIcon } from "@/components/icons";
import "./globals.css";

export const metadata: Metadata = {
  title: "Page not found · រកមិនឃើញទំព័រ",
};

/** 404 for URLs outside /km and /en, in both languages. */
export default function GlobalNotFound() {
  return (
    <html lang="en" className={`${kantumruy.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col font-sans">
        <main className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center gap-6 px-4 py-16 text-center">
          <LeafIcon className="size-12 text-accent" />
          <div lang="km" className="flex flex-col gap-1">
            <h1 className="text-2xl font-bold">រកមិនឃើញទំព័រ</h1>
            <Link href="/km" className="text-accent underline underline-offset-4">
              ទៅទំព័រដើម
            </Link>
          </div>
          <div className="flex flex-col gap-1">
            <h2 className="text-2xl font-bold">Page not found</h2>
            <Link href="/en" className="text-accent underline underline-offset-4">
              Go to the home page
            </Link>
          </div>
        </main>
      </body>
    </html>
  );
}
