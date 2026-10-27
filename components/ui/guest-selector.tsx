'use client';

import * as React from 'react';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import { Minus, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface GuestSelectorProps {
  // Title for the counter section
  title: string;
  // Description for the counter section
  description: string;
  // An array of image URLs to display for each guest
  imageSources: string[];
  // The maximum number of guests allowed
  maxGuests: number;
  // Callback function that triggers when the value changes
  onValueChange: (value: number) => void;
  // Optional initial value for the counter
  initialValue?: number;
  // Optional className for custom styling
  className?: string;
  // Text shown when no guests are selected
  emptyLabel?: string;
}

export const GuestSelector = React.forwardRef<HTMLDivElement, GuestSelectorProps>(
  (
    {
      title,
      description,
      imageSources,
      maxGuests,
      onValueChange,
      initialValue = 0,
      className,
      emptyLabel = "Select number of guests",
      ...props
    },
    ref
  ) => {
    const [count, setCount] = React.useState(initialValue);

    // Clamp the value between 0 and maxGuests
    const handleSetCount = (newCount: number) => {
      const clampedCount = Math.max(0, Math.min(newCount, maxGuests));
      setCount(clampedCount);
      onValueChange(clampedCount);
    };

    const handleIncrement = () => handleSetCount(count + 1);
    const handleDecrement = () => handleSetCount(count - 1);

    // Updated animation variants for a horizontal slide-in effect
    const imageVariants: Variants = {
      hidden: { opacity: 0, x: 20, scale: 0.9 },
      visible: (i: number) => ({
        opacity: 1,
        x: 0,
        scale: 1,
        transition: {
          delay: i * 0.05,
          duration: 0.3,
          ease: 'easeOut' as const,
        },
      }),
      exit: {
        opacity: 0,
        x: -20,
        scale: 0.9,
        transition: {
          duration: 0.2,
          ease: 'easeIn' as const,
        },
      },
    };

    return (
      <div
        ref={ref}
        className={cn('w-full max-w-sm rounded-lg p-4', className)}
        {...props}
      >
        {/* Animated Images Display */}
        <div className="relative flex h-48 min-h-[12rem] w-full items-center justify-center overflow-hidden">
          <AnimatePresence>
            {count === 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 0.5, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="absolute text-sm text-muted-foreground"
              >
                {emptyLabel}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Flex container for side-by-side images */}
          <motion.div className="flex items-center justify-center">
            <AnimatePresence>
              {imageSources.slice(0, count).map((src, i) => (
                <motion.img
                  key={i}
                  src={src}
                  alt={`Guest ${i + 1}`}
                  custom={i}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  variants={imageVariants}
                  // Negative margin overlaps the figures; it tightens as the party
                  // grows so up to 10 still fit on a phone
                  className="h-20 w-20 sm:h-24 sm:w-24 border-background object-contain first:ms-0 [-webkit-mask-image:-webkit-radial-gradient(white,black)]"
                  style={{ marginInlineStart: i === 0 ? 0 : count <= 3 ? -24 : count <= 6 ? -44 : -56 }}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        </div>

        {/* Divider */}
        <div className="my-6 h-px w-full bg-border" />

        {/* Controls Section */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-foreground">{title}</h3>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
          <div className="flex items-center gap-4">
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-9 w-9 rounded-full"
              onClick={handleDecrement}
              disabled={count === 0}
              aria-label="Decrement"
            >
              <Minus className="h-4 w-4" />
            </Button>
            <span
              className="w-8 text-center text-lg font-semibold text-foreground"
              aria-live="polite"
            >
              {count}
            </span>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-9 w-9 rounded-full"
              onClick={handleIncrement}
              disabled={count >= maxGuests}
              aria-label="Increment"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    );
  }
);

GuestSelector.displayName = 'GuestSelector';