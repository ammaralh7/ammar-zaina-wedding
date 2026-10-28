"use client";

import Reveal from "@/components/ui/reveal";
import ScrollTimeline from "@/components/ui/scroll-timeline";
import type { Dictionary } from "@/lib/dictionaries";

export function Schedule({ copy }: { copy: Dictionary["schedule"] }) {
  return (
    <section id="schedule" className="relative bg-gradient-to-b from-background via-champagne/40 to-background px-4 py-20 md:py-28">
      <Reveal className="text-center">
        <h2 className="font-serif text-4xl md:text-5xl">{copy.title}</h2>
        <p className="mt-4 text-sm text-muted-foreground">{copy.note}</p>
      </Reveal>
      <ScrollTimeline milestones={copy.items} />
    </section>
  );
}
