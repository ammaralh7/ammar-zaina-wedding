import Link from "next/link";
import { Languages } from "lucide-react";
import type { Dictionary } from "@/lib/dictionaries";
import type { Locale } from "@/lib/wedding-config";

export function SiteFooter({
  copy,
  names,
  lang,
  switchLanguage,
}: {
  copy: Dictionary["footer"];
  names: string;
  lang: Locale;
  switchLanguage: string;
}) {
  const other: Locale = lang === "en" ? "ar" : "en";

  return (
    <footer className="border-t border-gold-soft/60 bg-champagne/40 px-4 py-16 text-center">
      {copy.verse ? (
        <figure className="mx-auto mb-12 max-w-2xl">
          <blockquote className="font-[family-name:var(--font-quran)] text-2xl leading-loose text-gold-deep md:text-3xl">
            ﴿{copy.verse}﴾
          </blockquote>
          <figcaption className="mt-2 text-sm text-muted-foreground">{copy.verseReference}</figcaption>
        </figure>
      ) : null}
      <p className="font-script text-5xl text-gold-deep">{names}</p>
      <p className="mt-4 tracking-[0.4em] text-muted-foreground" dir="ltr">
        {copy.date}
      </p>
      <p className="mt-6 text-sm text-muted-foreground rtl:font-[family-name:var(--font-aref-ruqaa)] rtl:text-xl rtl:text-gold-deep">{copy.line}</p>
      <Link
        href={`/${other}`}
        hrefLang={other}
        className="mt-10 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm text-foreground/70 transition-colors hover:bg-champagne hover:text-foreground"
      >
        <Languages className="size-4" aria-hidden="true" />
        {switchLanguage}
      </Link>
    </footer>
  );
}
