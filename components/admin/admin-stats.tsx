"use client";

import { HeartHandshake, MailOpen, PartyPopper, Users } from "lucide-react";
import CountUp from "@/components/ui/count-up";
import Reveal from "@/components/ui/reveal";
import type { Dictionary } from "@/lib/dictionaries";
import type { RsvpStats } from "@/lib/rsvp";

export function AdminStats({ stats, copy }: { stats: RsvpStats; copy: Dictionary["admin"]["stats"] }) {
  const items = [
    { label: copy.guests, value: stats.guests, icon: Users, highlight: true },
    { label: copy.accepted, value: stats.accepted, icon: PartyPopper },
    { label: copy.declined, value: stats.declined, icon: HeartHandshake },
    { label: copy.replies, value: stats.replies, icon: MailOpen },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {items.map((item, i) => (
        <Reveal key={item.label} index={i}>
          <div
            className={
              item.highlight
                ? "relative overflow-hidden rounded-3xl bg-night p-6 text-night-foreground shadow-[0_20px_50px_-25px_var(--primary)]"
                : "rounded-3xl border border-gold-soft/70 bg-white/70 p-6"
            }
          >
            <item.icon className={item.highlight ? "size-5 text-primary" : "size-5 text-gold-deep"} aria-hidden="true" />
            <p className="mt-4 font-serif text-5xl tabular-nums" dir="ltr">
              <CountUp to={item.value} duration={1.6} digitEffect="slide" />
            </p>
            <p className={item.highlight ? "mt-2 text-sm text-night-foreground/70" : "mt-2 text-sm text-muted-foreground"}>
              {item.label}
            </p>
          </div>
        </Reveal>
      ))}
    </div>
  );
}
