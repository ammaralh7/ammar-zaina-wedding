// Settings for the RSVP form that aren't translated text.
// Wording for each language is in lib/dictionaries.ts.
export const wedding = {
  // Country preselected in the phone field (any country can be chosen)
  defaultPhoneCountry: "EG",
  // Most guests one reply can bring, including the guest
  maxPartySize: 10,
} as const;

export const locales = ["en", "ar"] as const;
export type Locale = (typeof locales)[number];

// The page the main link opens, whatever the visitor's phone language.
// English stays one tap away in the footer, and /en links straight to it.
export const defaultLocale: Locale = "ar";

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

export function dirFor(locale: Locale) {
  return locale === "ar" ? "rtl" : "ltr";
}
