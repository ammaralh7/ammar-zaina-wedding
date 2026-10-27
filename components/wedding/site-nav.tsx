import Link from "next/link";
import { Languages } from "lucide-react";
import type { Dictionary } from "@/lib/dictionaries";
import type { Locale } from "@/lib/wedding-config";

export function SiteNav({ copy, lang }: { copy: Dictionary["nav"]; lang: Locale }) {
  const other: Locale = lang === "en" ? "ar" : "en";

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <nav className="mx-4 mt-3 flex max-w-5xl items-center justify-between rounded-full border border-gold-soft/60 bg-background/70 px-4 py-2 shadow-sm backdrop-blur-md md:mx-auto">
        <Link href={`/${lang}`} className="font-script text-2xl leading-none text-gold-deep" aria-label="Home">
          {copy.monogram}
        </Link>
        <div className="flex items-center gap-2">
          <Link
            href={`/${other}`}
            hrefLang={other}
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm text-foreground/80 transition-colors hover:bg-champagne hover:text-foreground"
          >
            <Languages className="size-4" aria-hidden="true" />
            {copy.switchLanguage}
          </Link>
          <a
            href="#rsvp"
            className="rounded-full bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground shadow-[0_4px_20px_-6px_var(--primary)] transition-transform hover:-translate-y-0.5"
          >
            {copy.rsvp}
          </a>
        </div>
      </nav>
    </header>
  );
}
