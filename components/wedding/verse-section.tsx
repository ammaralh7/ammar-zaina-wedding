"use client";

import { motion } from "motion/react";
import { LampContainer } from "@/components/ui/lamp";
import type { Dictionary } from "@/lib/dictionaries";

const rise = (delay: number) => ({
  initial: { opacity: 0, y: 40, filter: "blur(8px)" },
  whileInView: { opacity: 1, y: 0, filter: "blur(0px)" },
  viewport: { once: true, amount: 0.4 },
  transition: { delay, duration: 1, ease: [0.22, 1, 0.36, 1] as const },
});

export function VerseSection({ copy }: { copy: Dictionary["verse"] }) {
  return (
    <section id="verse" aria-label={copy.reference}>
      <LampContainer className="min-h-[82svh] rounded-none">
        <div className="flex max-w-3xl flex-col items-center gap-6 text-center">
          {copy.bismillah ? (
            <motion.p
              {...rise(0.3)}
              lang="ar"
              dir="rtl"
              className="font-[family-name:var(--font-aref-ruqaa)] text-2xl text-gold-soft md:text-3xl"
            >
              {copy.bismillah}
            </motion.p>
          ) : null}
          {copy.intro ? (
            <motion.p
              {...rise(0.3)}
              className="font-[family-name:var(--font-aref-ruqaa)] text-2xl text-gold-soft md:text-3xl"
            >
              {copy.intro}
            </motion.p>
          ) : null}
          <motion.blockquote
            {...rise(0.55)}
            lang="ar"
            dir="rtl"
            className="bg-gradient-to-b from-[#fff3d1] via-[#f1d79a] to-[#c9971c] bg-clip-text font-[family-name:var(--font-amiri)] text-3xl leading-[1.9] text-transparent md:text-5xl md:leading-[1.8]"
          >
            ﴿{copy.text}﴾
          </motion.blockquote>
          <motion.p {...rise(0.8)} className="text-sm tracking-[0.25em] text-night-foreground/60">
            {copy.reference}
          </motion.p>
          {copy.translation ? (
            <motion.p {...rise(1)} className="max-w-xl font-serif text-lg italic leading-relaxed text-night-foreground/80">
              “{copy.translation}”
            </motion.p>
          ) : null}
        </div>
      </LampContainer>
    </section>
  );
}
