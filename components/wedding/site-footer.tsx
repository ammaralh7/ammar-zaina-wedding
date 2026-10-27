import type { Dictionary } from "@/lib/dictionaries";

export function SiteFooter({ copy, names }: { copy: Dictionary["footer"]; names: string }) {
  return (
    <footer className="border-t border-gold-soft/60 bg-champagne/40 px-4 py-16 text-center">
      <p className="font-script text-5xl text-gold-deep">{names}</p>
      <p className="mt-4 tracking-[0.4em] text-muted-foreground" dir="ltr">
        {copy.date}
      </p>
      <p className="mt-6 text-xs text-muted-foreground">{copy.line}</p>
    </footer>
  );
}
