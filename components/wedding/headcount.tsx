"use client";

import { Users } from "lucide-react";
import CountUp from "@/components/ui/count-up";
import Reveal from "@/components/ui/reveal";

export function HeadcountBadge({ count, label }: { count: number; label: string }) {
  return (
    <Reveal index={2}>
      <div className="inline-flex items-center gap-4 rounded-full border border-gold-soft/25 bg-white/[0.05] px-6 py-3 backdrop-blur-md">
        <Users className="size-5 text-primary" aria-hidden="true" />
        <span className="font-serif text-3xl text-primary tabular-nums" dir="ltr">
          <CountUp to={count} duration={2.2} digitEffect="slide" />
        </span>
        <span className="text-sm text-night-foreground/75">{label}</span>
      </div>
    </Reveal>
  );
}
