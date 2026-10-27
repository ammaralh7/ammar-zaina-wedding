import { CalendarHeart, CalendarPlus, MailCheck, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import Reveal from "@/components/ui/reveal";
import type { Dictionary } from "@/lib/dictionaries";
import { wedding } from "@/lib/wedding-config";

export function Details({ copy, rsvpLabel }: { copy: Dictionary["details"]; rsvpLabel: string }) {
  const cards = [
    {
      icon: CalendarHeart,
      label: copy.whenLabel,
      value: copy.when,
      note: copy.whenNote,
      action: (
        <Button asChild variant="outline" className="rounded-full border-gold-soft">
          <a href="/api/calendar" download>
            <CalendarPlus data-icon="inline-start" />
            {copy.addToCalendar}
          </a>
        </Button>
      ),
    },
    {
      icon: MapPin,
      label: copy.whereLabel,
      value: copy.where,
      note: copy.whereNote,
      action: (
        <Button asChild variant="outline" className="rounded-full border-gold-soft">
          <a href={wedding.mapsUrl} target="_blank" rel="noreferrer">
            <MapPin data-icon="inline-start" />
            {copy.openMap}
          </a>
        </Button>
      ),
    },
    {
      icon: MailCheck,
      label: copy.replyLabel,
      value: copy.reply,
      note: copy.replyNote,
      action: (
        <Button asChild className="rounded-full">
          <a href="#rsvp">{rsvpLabel}</a>
        </Button>
      ),
    },
  ];

  return (
    <section id="details" className="relative px-4 py-28">
      <Reveal className="mb-14 text-center">
        <h2 className="font-serif text-4xl md:text-5xl">{copy.title}</h2>
        <div className="mx-auto mt-5 h-px w-24 bg-gradient-to-r from-transparent via-gold-deep to-transparent" />
      </Reveal>

      <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-3">
        {cards.map((card, i) => (
          <Reveal key={card.label} index={i}>
            <article className="group relative flex h-full flex-col items-center gap-3 overflow-hidden rounded-3xl border border-gold-soft/70 bg-white/60 p-8 text-center shadow-[0_20px_60px_-30px_rgba(154,107,20,0.45)] backdrop-blur transition-transform duration-500 hover:-translate-y-2">
              <span className="pointer-events-none absolute -top-16 size-40 rounded-full bg-primary/20 blur-3xl transition-opacity duration-500 group-hover:opacity-100 md:opacity-0" />
              <span className="relative grid size-14 place-items-center rounded-full bg-champagne text-gold-deep ring-1 ring-gold-soft">
                <card.icon className="size-6" aria-hidden="true" />
              </span>
              <p className="relative text-xs tracking-[0.3em] text-gold-deep uppercase">{card.label}</p>
              <p className="relative font-serif text-2xl">{card.value}</p>
              <p className="relative text-sm text-muted-foreground">{card.note}</p>
              <div className="relative mt-auto pt-4">{card.action}</div>
            </article>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
