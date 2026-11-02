import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["km", "en"],
  // Decision D1: "/" picks from the browser language, otherwise English.
  defaultLocale: "en",
  localePrefix: "always",
});

export type Locale = (typeof routing.locales)[number];
