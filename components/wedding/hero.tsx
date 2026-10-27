"use client";

import { useEffect, useState } from "react";
import { MotionConfig, motion } from "motion/react";
import { ChevronDown } from "lucide-react";
import { BorderBeam } from "@/components/ui/border-beam";
import ClothPeelReveal from "@/components/ui/cloth-peel-reveal";
import { SparklesCore } from "@/components/ui/sparkles";
import { TextReveal } from "@/components/ui/text-reveal";
import { TextShimmer } from "@/components/ui/text-shimmer";
import type { Dictionary } from "@/lib/dictionaries";
import { wedding, type Locale } from "@/lib/wedding-config";

const SHEET_COLOR = "#f4e7c8";
const GOLD = "#9a6b14";
const GOLD_LIGHT = "#ffe7a3";

export function Hero({ copy, lang }: { copy: Dictionary["hero"]; lang: Locale }) {
  const [revealed, setRevealed] = useState(false);
  const [sheetFont, setSheetFont] = useState<string>();

  // The silk sheet draws its monogram on a canvas, so wait for the script font.
  useEffect(() => {
    const variable = lang === "ar" ? "--font-aref-ruqaa" : "--font-great-vibes";
    const family = getComputedStyle(document.documentElement).getPropertyValue(variable).trim();
    if (!family) return;
    let cancelled = false;
    document.fonts
      .load(`400 120px ${family}`, copy.sheetText)
      .then(() => {
        if (!cancelled) setSheetFont(family);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [lang, copy.sheetText]);

  const enter = (delay: number) => ({
    initial: { opacity: 0, y: 24, filter: "blur(10px)" },
    animate: revealed ? { opacity: 1, y: 0, filter: "blur(0px)" } : undefined,
    transition: { duration: 1.1, delay, ease: [0.22, 1, 0.36, 1] as const },
  });

  // "user": visitors who ask for reduced motion get fades without movement
  return (
    <MotionConfig reducedMotion="user">
      <ClothPeelReveal
        key={sheetFont ?? "fallback"}
        height="100svh"
        sheetColor={SHEET_COLOR}
        textColor={GOLD}
        sheetText={copy.sheetText}
        fontFamily={sheetFont}
        delayMs={1300}
        durationMs={2000}
        foldAmplitude={0.16}
        tilt={0.9}
        onReveal={() => setRevealed(true)}
      >
        <section className="relative isolate flex h-full w-full items-center justify-center overflow-hidden bg-[radial-gradient(ellipse_at_center,#fffaf0_0%,#fbf0d6_55%,#f1dfb6_100%)]">
          <SparklesCore
            id="hero-sparkles"
            className="absolute inset-0 -z-10 h-full w-full"
            background="transparent"
            particleColor="#c9971c"
            minSize={0.6}
            maxSize={2.2}
            particleDensity={110}
            speed={1.4}
          />
          <BorderBeam
            color="#d9a52a"
            length={14}
            thickness={2}
            speed={10}
            className="pointer-events-none absolute inset-6 -z-10 rounded-[2rem] border border-gold-soft/70 md:inset-10"
          />
          <div className="pointer-events-none absolute inset-8 -z-10 rounded-[1.75rem] border border-gold-soft/40 md:inset-12" />

          <div className="flex max-w-3xl flex-col items-center px-6 text-center">
            {copy.bismillah ? (
              <motion.p
                {...enter(0)}
                className="mb-6 font-[family-name:var(--font-aref-ruqaa)] text-2xl text-gold-deep md:text-3xl"
              >
                {copy.bismillah}
              </motion.p>
            ) : null}
            <TextReveal
              text={copy.kicker}
              play={revealed}
              startOnView={false}
              className="text-xs uppercase tracking-[0.4em] text-gold-deep md:text-sm rtl:text-lg rtl:md:text-xl"
            />

            <motion.h1 {...enter(0.25)} className="mt-6">
              <TextShimmer
                text={copy.names}
                as="span"
                duration={3.5}
                delay={1.5}
                spread={30}
                baseColor={GOLD}
                shimmerColor={GOLD_LIGHT}
                staticColor={GOLD}
                className="font-script text-6xl leading-[1.15] sm:text-7xl md:text-8xl lg:text-9xl"
              />
            </motion.h1>

            <motion.p {...enter(0.6)} className="mt-2 font-serif text-xl text-foreground/80 md:text-2xl">
              {copy.tagline}
            </motion.p>

            <motion.div {...enter(0.85)} className="my-8 flex items-center gap-4" aria-hidden="true">
              <span className="h-px w-16 bg-gradient-to-r from-transparent to-gold-deep md:w-24" />
              <span className="size-2 rotate-45 bg-primary shadow-[0_0_12px_var(--primary)]" />
              <span className="h-px w-16 bg-gradient-to-l from-transparent to-gold-deep md:w-24" />
            </motion.div>

            <motion.div {...enter(1.05)}>
              <TextShimmer
                text={copy.date}
                duration={4}
                delay={2}
                baseColor="#2a2418"
                shimmerColor="#d9a52a"
                staticColor="#2a2418"
                className="text-lg tracking-[0.2em] uppercase md:text-2xl"
              />
            </motion.div>

            {copy.hijri ? (
              <motion.p {...enter(1.15)} className="mt-2 text-sm text-gold-deep rtl:text-base">
                {copy.hijri}
              </motion.p>
            ) : null}

            <motion.p {...enter(1.25)} className="mt-3 text-sm tracking-[0.3em] text-muted-foreground uppercase rtl:text-base">
              {copy.city}
            </motion.p>
          </div>

          <motion.a
            href={wedding.showVerse ? "#verse" : "#invitation"}
            {...enter(1.6)}
            className="absolute bottom-8 flex flex-col [@media(max-height:640px)]:hidden items-center gap-1 text-xs tracking-[0.3em] text-gold-deep uppercase"
          >
            {copy.scroll}
            <motion.span
              animate={{ y: [0, 6, 0] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
            >
              <ChevronDown className="size-5" aria-hidden="true" />
            </motion.span>
          </motion.a>
        </section>
      </ClothPeelReveal>
    </MotionConfig>
  );
}
