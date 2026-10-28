"use client";

import React, { useEffect, useRef, useState } from "react";

export interface Milestone {
  id: string;
  title: string;
  description: string;
  date: string;
}

export interface TimelineProps {
  milestones: Milestone[];
}

export default function Component({ milestones }: TimelineProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    let frame = 0;
    const measure = () => {
      frame = 0;
      if (!containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;

      // Calculate progress based on the middle of the screen
      const triggerPoint = windowHeight / 2;
      const totalHeight = rect.height;
      const scrolledPast = triggerPoint - rect.top;

      let progress = scrolledPast / totalHeight;
      progress = Math.max(0, Math.min(1, progress));
      // Re-render only when the line visibly moves
      setScrollProgress((prev) => (Math.abs(prev - progress) < 0.002 ? prev : progress));
    };
    // At most one measurement per frame, however many scroll events arrive
    const handleScroll = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    measure(); // Initial calculation

    return () => {
      window.removeEventListener("scroll", handleScroll);
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-12 font-sans" ref={containerRef}>
      <div className="relative">
        {/* Background line (faded) */}
        <div className="absolute start-4 md:start-1/2 top-0 bottom-0 w-[2px] bg-gold-soft/50 -translate-x-1/2 rtl:translate-x-1/2" />

        {/* Animated foreground line (draws on scroll). Scaled rather than
            resized, so drawing it never triggers a layout pass. */}
        <div
          className="absolute start-4 md:start-1/2 top-0 bottom-0 w-[2px] origin-top bg-gradient-to-b from-primary to-gold-deep shadow-[0_0_12px_var(--primary)] -translate-x-1/2 rtl:translate-x-1/2 transition-transform duration-100 ease-out z-0"
          style={{ scale: `1 ${scrollProgress}` }}
        />

        <div className="flex flex-col gap-16 md:gap-24 relative z-10">
          {milestones.map((milestone, index) => {
            // Determine if the line has reached this item
            const itemThreshold = index / (milestones.length - 1 || 1);
            const isActive = scrollProgress >= itemThreshold - 0.05; 
            const isEven = index % 2 === 0;

            const dotClasses = isActive
              ? "border-gold-deep bg-primary shadow-[0_0_14px_var(--primary)] scale-125"
              : "border-gold-soft bg-background scale-100";

            return (
              <div key={milestone.id} className={`relative flex flex-col md:flex-row ${isEven ? 'md:flex-row-reverse' : ''} items-start w-full group`}>
                
                {/* The Dot */}
                <div className={`absolute start-4 md:start-1/2 top-0 w-4 h-4 rounded-full border-2 -translate-x-1/2 rtl:translate-x-1/2 mt-1.5 transition-all duration-500 z-20 ${dotClasses}`} />

                {/* Desktop Empty Space (pushes content to left/right) */}
                <div className="hidden md:block w-1/2" />

                {/* Content Card */}
                <div 
                  className={`w-full md:w-1/2 ps-12 md:ps-0 ${isEven ? 'md:pe-12 md:text-end' : 'md:ps-12 md:text-start'} transition-all duration-700 ease-out ${isActive ? 'opacity-100 translate-y-0' : 'opacity-30 translate-y-8'}`}
                >
                  <div className="inline-block px-3 py-1 mb-3 rounded-full border border-gold-soft bg-champagne/60 text-xs tracking-widest text-gold-deep">
                    {milestone.date}
                  </div>
                  <h3 className="font-serif text-2xl md:text-3xl tracking-tight text-foreground">
                    {milestone.title}
                  </h3>
                  <p className="mt-3 text-base leading-relaxed text-muted-foreground">
                    {milestone.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}