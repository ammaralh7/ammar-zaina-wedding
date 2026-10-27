// Everything about the day that isn't translated text lives here.
// Wording for each language is in lib/dictionaries.ts.
export const wedding = {
  // Ceremony start in Cairo summer time (EEST, UTC+3). Placeholder time: update once confirmed.
  startsAt: "2027-07-27T19:00:00+03:00",
  endsAt: "2027-07-28T01:00:00+03:00",
  mapsUrl: "https://www.google.com/maps/search/?api=1&query=Cairo%2C+Egypt",
  // Show "N guests are coming" on the public page (number only, never names)
  showPublicHeadcount: true,
  // Opening Qur'an verse (Ar-Rum 30:21) shown under a gold lamp
  showVerse: true,
  // Country preselected in the phone field (any country can be chosen)
  defaultPhoneCountry: "EG",
  maxPartySize: 10,
} as const;

export const locales = ["en", "ar"] as const;
export type Locale = (typeof locales)[number];

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

export function dirFor(locale: Locale) {
  return locale === "ar" ? "rtl" : "ltr";
}
