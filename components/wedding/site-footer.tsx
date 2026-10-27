import type { Dictionary } from "@/lib/dictionaries";

export function SiteFooter({ copy, names }: { copy: Dictionary["footer"]; names: string }) {
  return (
    <footer className="border-t border-gold-soft/60 bg-champagne/40 px-4 py-16 text-center">
      {copy.verse ? (
        <figure className="mx-auto mb-12 max-w-2xl">
          <blockquote className="font-[family-name:var(--font-amiri)] text-2xl leading-loose text-gold-deep md:text-3xl">
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
    </footer>
  );
}
