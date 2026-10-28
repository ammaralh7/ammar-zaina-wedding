"use client";

import { useEffect, useRef } from "react";

// Same props as the 21st.dev SparklesCore (tsparticles), drawn on one small
// canvas loop instead. tsparticles ran ~260 particles on a phone at up to 120fps
// and never stopped, which halved the frame rate of the whole page.
type ParticlesProps = {
  id?: string;
  className?: string;
  background?: string;
  minSize?: number;
  maxSize?: number;
  /** Twinkle speed */
  speed?: number;
  particleColor?: string;
  /** Particles per 400×400px, as in tsparticles; thinned and capped below */
  particleDensity?: number;
};

type Dot = { x: number; y: number; vx: number; vy: number; r: number; a: number; da: number };

const DENSITY_SCALE = 0.45;
const MAX_DOTS = 220;
const FRAME_MS = 1000 / 60;

export const SparklesCore = ({
  id,
  className,
  background = "transparent",
  minSize = 1,
  maxSize = 3,
  speed = 4,
  particleColor = "#ffffff",
  particleDensity = 120,
}: ParticlesProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let width = 0;
    let height = 0;
    let dots: Dot[] = [];

    const spawn = (): Dot => {
      const angle = Math.random() * Math.PI * 2;
      const v = 0.1 + Math.random() * 0.9; // px per 60fps frame, as tsparticles' move.speed
      return {
        x: Math.random() * width,
        y: Math.random() * height,
        vx: Math.cos(angle) * v,
        vy: Math.sin(angle) * v,
        r: minSize + Math.random() * (maxSize - minSize),
        a: 0.1 + Math.random() * 0.9,
        da: (Math.random() < 0.5 ? -1 : 1) * speed * (0.3 + Math.random() * 0.6) * 0.01,
      };
    };

    const resize = () => {
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = Math.max(1, Math.round(width * dpr));
      canvas.height = Math.max(1, Math.round(height * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.min(MAX_DOTS, Math.round(((width * height) / 160_000) * particleDensity * DENSITY_SCALE));
      dots = Array.from({ length: count }, spawn);
    };

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      if (background !== "transparent") {
        ctx.fillStyle = background;
        ctx.fillRect(0, 0, width, height);
      }
      ctx.fillStyle = particleColor;
      for (const d of dots) {
        ctx.globalAlpha = d.a;
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    };

    const step = () => {
      for (const d of dots) {
        d.x += d.vx;
        d.y += d.vy;
        // leave one edge, come back in on the other
        if (d.x < -d.r) d.x = width + d.r;
        else if (d.x > width + d.r) d.x = -d.r;
        if (d.y < -d.r) d.y = height + d.r;
        else if (d.y > height + d.r) d.y = -d.r;
        d.a += d.da;
        if (d.a >= 1 || d.a <= 0.1) {
          d.a = Math.min(1, Math.max(0.1, d.a));
          d.da = -d.da;
        }
      }
    };

    let raf = 0;
    let last = 0;
    let onScreen = false;
    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      // 120Hz screens would otherwise do twice the work for no visible gain
      if (now - last < FRAME_MS - 1) return;
      last = now;
      step();
      draw();
    };
    const sync = () => {
      const run = onScreen && document.visibilityState === "visible" && !reduced;
      if (run && !raf) raf = requestAnimationFrame(loop);
      if (!run && raf) {
        cancelAnimationFrame(raf);
        raf = 0;
      }
    };

    resize();
    draw();
    canvas.style.opacity = "1";

    const ro = new ResizeObserver(() => {
      resize();
      draw();
    });
    ro.observe(canvas);
    const io = new IntersectionObserver(([entry]) => {
      onScreen = entry.isIntersecting;
      sync();
    });
    io.observe(canvas);
    document.addEventListener("visibilitychange", sync);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      document.removeEventListener("visibilitychange", sync);
    };
  }, [background, minSize, maxSize, speed, particleColor, particleDensity]);

  return (
    <div className={className}>
      <canvas
        ref={canvasRef}
        id={id}
        aria-hidden="true"
        className="block h-full w-full opacity-0 transition-opacity duration-1000"
      />
    </div>
  );
};
