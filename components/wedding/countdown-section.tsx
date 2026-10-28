"use client";

import type { ReactNode } from "react";
import { AnimatedCountdown } from "@/components/ui/animated-countdown";
import { FireworksBackground } from "@/components/ui/fireworks-show";
import Reveal from "@/components/ui/reveal";
import { TextShimmer } from "@/components/ui/text-shimmer";
import type { Dictionary } from "@/lib/dictionaries";
import { wedding, type Locale } from "@/lib/wedding-config";

export const GOLD_FIREWORKS = ["#ffc23d", "#ffe7a3", "#f1d79a", "#ffffff", "#e8b04b", "#fff3d1"];

export function CountdownSection({
  copy,
  lang,
  children,
}: {
  copy: Dictionary["countdown"];
  lang: Locale;
  children?: ReactNode;
}) {
  return (
    <FireworksBackground
      colors={GOLD_FIREWORKS}
      className="bg-[radial-gradient(ellipse_at_top,#2b2010_0%,var(--night)_65%)] text-night-foreground"
    >
      <section
        id="countdown"
        className="flex min-h-svh flex-col items-center justify-center gap-10 px-4 py-24 text-center"
      >
        <Reveal>
          <TextShimmer
            text={copy.title}
            as="h2"
            duration={3}
            delay={1}
            baseColor="#f1d79a"
            shimmerColor="#ffffff"
            className="font-serif text-4xl md:text-6xl"
          />
          {copy.verse ? (
            <p className="mt-5 font-[family-name:var(--font-quran)] text-2xl leading-loose text-gold-soft md:text-3xl">
              ﴿{copy.verse}﴾
              <span className="mt-2 block text-sm text-night-foreground/50">{copy.verseReference}</span>
            </p>
          ) : null}
        </Reveal>

        <Reveal index={1} className="max-w-full">
          <AnimatedCountdown
            targetDate={wedding.startsAt}
            variant="modern"
            size="lg"
            labels={copy.labels}
            completionMessage={copy.done}
            ariaLabel={copy.title}
            // Arabic-Indic digits on the Arabic page, like the rest of its text
            locale={lang === "ar" ? "ar-EG-u-nu-arab" : undefined}
            // No backdrop blur: over the fireworks it had to be redone every frame
            containerClassName="border-gold-soft/20 bg-night/70 shadow-[0_0_80px_-20px_rgba(255,194,61,0.35)] backdrop-blur-none"
            unitClassName="border-gold-soft/25 bg-white/[0.05] hover:border-primary/60 hover:bg-white/[0.08]"
            numberClassName="font-serif font-normal text-primary drop-shadow-[0_0_18px_rgba(255,194,61,0.45)]"
            labelClassName="text-night-foreground/60"
            accentClassName="via-primary"
          />
        </Reveal>

        {children}
      </section>
    </FireworksBackground>
  );
}
