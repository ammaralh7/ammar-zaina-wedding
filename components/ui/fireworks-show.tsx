"use client";

import React, { useEffect, useRef } from "react";
import { cn } from "@/lib/utils"; 

interface Particle {
  x: number;
  y: number;
  color: string;
  velocity: {
    x: number;
    y: number;
  };
  alpha: number;
  lifetime: number;
  size: number;
}

interface Firework {
  x: number;
  y: number;
  color: string;
  velocity: {
    x: number;
    y: number;
  };
  particles: Particle[];
  exploded: boolean;
  timeToExplode: number;
}

const DEFAULT_COLORS = [
  "#9b87f5",
  "#D946EF", 
  "#F97316", 
  "#0EA5E9", 
  "#ea384c", 
  "#10B981", 
  "#FCD34D", 
];

export const FireworksBackground = ({ 
  children,
  className,
  colors = DEFAULT_COLORS,
}: {
  children?: React.ReactNode;
  className?: string;
  /** Firework palette */
  colors?: string[];
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fireworksRef = useRef<Firework[]>([]);
  const animationFrameRef = useRef<number>(0);
  // Set on mount; Date.now() during render breaks prerendering
  const lastFireworkTimeRef = useRef<number>(0);

  const createFirework = (x?: number, y?: number, targetY?: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const startX = x || Math.random() * canvas.width;
    const startY = canvas.height;
    const color = colors[Math.floor(Math.random() * colors.length)];
    const angle = (Math.random() * Math.PI) / 2 - Math.PI / 4; // Random angle between -45 and 45 degrees
    const velocity = 6 + Math.random() * 4; // Random velocity between 6 and 10

    const target = targetY || canvas.height * (0.1 + Math.random() * 0.4); // Target height between 10% and 50% of canvas height

    const firework: Firework = {
      x: startX,
      y: startY,
      color,
      velocity: {
        x: Math.sin(angle) * velocity,
        y: -Math.cos(angle) * velocity * 1.5,
      },
      particles: [],
      exploded: false,
      timeToExplode: target,
    };

    fireworksRef.current.push(firework);
  };

  const explodeFirework = (firework: Firework) => {
    const particleCount = 60 + Math.floor(Math.random() * 40);

    for (let i = 0; i < particleCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const velocity = Math.random() * 5 + 1;

      firework.particles.push({
        x: firework.x,
        y: firework.y,
        color: firework.color,
        velocity: {
          x: Math.cos(angle) * velocity * (0.5 + Math.random()),
          y: Math.sin(angle) * velocity * (0.5 + Math.random()),
        },
        alpha: 1,
        lifetime: Math.random() * 30 + 30,
        size: Math.random() * 3 + 1,
      });
    }
  };

  const updateAndDraw = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");

    if (!canvas || !ctx) return;

    // Fade previous frames toward transparent so the trails work on any background
    ctx.globalCompositeOperation = "destination-out";
    ctx.fillStyle = "rgba(0, 0, 0, 0.1)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.globalCompositeOperation = "source-over";

    const currentFireworks = fireworksRef.current;
    for (let i = 0; i < currentFireworks.length; i++) {
      const firework = currentFireworks[i];

      if (!firework.exploded) {
        firework.x += firework.velocity.x;
        firework.y += firework.velocity.y;
        firework.velocity.y += 0.1;

        ctx.beginPath();
        ctx.arc(firework.x, firework.y, 3, 0, Math.PI * 2);
        ctx.fillStyle = firework.color;
        ctx.fill();

        if (
          firework.y <= firework.timeToExplode ||
          firework.velocity.y >= 0 ||
          firework.x < 0 ||
          firework.x > canvas.width
        ) {
          if (firework.y > 0 && firework.y < canvas.height) { 
            explodeFirework(firework);
          }
          firework.exploded = true;
        }
      } else {
        for (let j = 0; j < firework.particles.length; j++) {
          const particle = firework.particles[j];

          particle.x += particle.velocity.x;
          particle.y += particle.velocity.y;
          particle.velocity.y += 0.05;
          particle.alpha -= 1 / particle.lifetime;

          if (particle.alpha <= 0.1) {
            firework.particles.splice(j, 1);
            j--;
            continue;
          }

          ctx.globalAlpha = particle.alpha;
          ctx.beginPath();
          ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
          ctx.fillStyle = particle.color;
          ctx.fill();
          ctx.globalAlpha = 1;
        }

        if (firework.particles.length === 0) {
          currentFireworks.splice(i, 1);
          i--;
        }
      }
    }

    const now = Date.now();
    if (now - lastFireworkTimeRef.current > 1000 + Math.random() * 2000) {
      const numberOfFireworks = Math.floor(Math.random() * 2) + 1;
      for (let i = 0; i < numberOfFireworks; i++) {
        createFirework();
      }
      lastFireworkTimeRef.current = now;
    }

    animationFrameRef.current = requestAnimationFrame(updateAndDraw);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Size to the container rather than the window, so it works inside a section
    const updateCanvasSize = () => {
      const parent = canvas.parentElement;
      canvas.width = parent?.clientWidth || window.innerWidth;
      canvas.height = parent?.clientHeight || window.innerHeight;
    };

    updateCanvasSize();
    const observer = new ResizeObserver(updateCanvasSize);
    if (canvas.parentElement) observer.observe(canvas.parentElement);


    for (let i = 0; i < 3; i++) {
      createFirework();
    }
    lastFireworkTimeRef.current = Date.now();

    // Only draw while the show is on screen and the tab is visible
    let onScreen = false;
    const sync = () => {
      const run = onScreen && document.visibilityState === "visible";
      if (run && !animationFrameRef.current) {
        lastFireworkTimeRef.current = Date.now();
        animationFrameRef.current = requestAnimationFrame(updateAndDraw);
      } else if (!run && animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = 0;
      }
    };
    const visibility = new IntersectionObserver(([entry]) => {
      onScreen = entry.isIntersecting;
      sync();
    });
    visibility.observe(canvas);
    document.addEventListener("visibilitychange", sync);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = 0;
      }
      observer.disconnect();
      visibility.disconnect();
      document.removeEventListener("visibilitychange", sync);
    };
  }, []);

  return (
    <div className={cn("relative w-full h-full overflow-hidden", className)}>
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
      <div className="relative z-10 w-full h-full">
        {children}
      </div>
    </div>
  );
};