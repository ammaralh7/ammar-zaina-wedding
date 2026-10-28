import Link from "next/link";
import { notFound } from "next/navigation";
import { Languages } from "lucide-react";
import { RsvpForm } from "@/components/wedding/rsvp-form";
import { getDictionary } from "@/lib/dictionaries";
import { isLocale, type Locale } from "@/lib/wedding-config";

// One page: the couple's names, then a form for name, phone and number of guests.
export default async function RsvpPage({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = getDictionary(lang);
  const other: Locale = lang === "en" ? "ar" : "en";

  return (
    <main className="flex min-h-svh flex-col items-center bg-[radial-gradient(ellipse_at_top,#fffaf0_0%,#fbf0d6_55%,#f1dfb6_100%)] px-4 py-12 md:py-16">
      <header className="mb-8 text-center">
        <p className="font-script text-6xl leading-[1.3] text-gold-deep md:text-7xl">{dict.page.names}</p>
        <p className="mt-2 text-sm tracking-[0.2em] text-muted-foreground uppercase rtl:text-base rtl:tracking-normal">
          {dict.page.date}
        </p>
      </header>

      <RsvpForm copy={dict.rsvp} confirmation={dict.confirmation} lang={lang} />

      <Link
        href={`/${other}`}
        hrefLang={other}
        className="mt-10 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm text-foreground/70 transition-colors hover:bg-champagne hover:text-foreground"
      >
        <Languages className="size-4" aria-hidden="true" />
        {dict.page.switchLanguage}
      </Link>
    </main>
  );
}
