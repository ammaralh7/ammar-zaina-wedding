"use client"

// From the 21st.dev catalog (motiondotdev/motion-scroll-word-reveal).
// The registry item ships without its stylesheet, so the original
// .scroll-word-reveal* classes are expressed with Tailwind here, and the
// scene tracks page scroll instead of its own scroll container.

import { Fragment, useRef } from "react"
import {
  motion,
  useScroll,
  useTransform,
  type MotionValue,
} from "motion/react"
import { cn } from "@/lib/utils"
import { usePrefersReducedMotion } from "@/lib/use-prefers-reduced-motion"

const REST_OPACITY = 0.15
const REVEAL_SPAN = 0.8
const WORD_WINDOW = 0.2

function getWordRange(index: number, count: number) {
  const start = count <= 1 ? 0 : (index / (count - 1)) * REVEAL_SPAN
  return { start, end: Math.min(1, start + WORD_WINDOW) }
}

export function getWordOpacity(
  progress: number,
  { start, end }: { start: number; end: number },
  rest = REST_OPACITY,
) {
  if (progress <= start) return rest
  if (progress >= end) return 1
  const t = (progress - start) / (end - start)
  return rest + (1 - rest) * t
}

function Word({
  children,
  progress,
  index,
  count,
  reducedMotion,
}: {
  children: string
  progress: MotionValue<number>
  index: number
  count: number
  reducedMotion: boolean
}) {
  const range = getWordRange(index, count)
  const opacity = useTransform(progress, (value) => getWordOpacity(value, range))

  return (
    <motion.span aria-hidden="true" style={{ opacity: reducedMotion ? 1 : opacity }}>
      {children}
    </motion.span>
  )
}

export function ScrollWordReveal({
  text,
  kicker,
  className,
  headingClassName,
}: {
  text: string
  kicker?: string
  className?: string
  headingClassName?: string
}) {
  const targetRef = useRef<HTMLElement>(null)
  const reducedMotion = usePrefersReducedMotion()
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start start", "end end"],
  })
  const words = text.split(" ")

  return (
    <section ref={targetRef} className={cn("relative h-[220svh]", className)}>
      <div className="sticky top-0 flex h-svh items-center">
        <div className="mx-auto flex w-full max-w-4xl items-stretch gap-6 px-6 md:gap-10">
          <div className="relative w-[2px] shrink-0 overflow-hidden rounded-full bg-gold-soft/40" aria-hidden="true">
            <motion.span
              className="absolute inset-0 origin-top bg-gradient-to-b from-primary to-gold-deep"
              style={{ scaleY: reducedMotion ? 1 : scrollYProgress }}
            />
          </div>
          <div className="py-4">
            {kicker ? (
              <p className="mb-6 text-xs uppercase tracking-[0.35em] text-gold-deep">{kicker}</p>
            ) : null}
            <h2 className={cn("text-3xl leading-snug md:text-5xl md:leading-tight", headingClassName)} aria-label={text}>
              {words.map((word, index) => (
                <Fragment key={`${word}-${index}`}>
                  <Word
                    progress={scrollYProgress}
                    index={index}
                    count={words.length}
                    reducedMotion={!!reducedMotion}
                  >
                    {word}
                  </Word>
                  {index < words.length - 1 ? " " : null}
                </Fragment>
              ))}
            </h2>
          </div>
        </div>
      </div>
    </section>
  )
}

export default ScrollWordReveal
