'use client';

import type React from 'react';
import { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

type FallingPatternProps = React.ComponentProps<'div'> & {
	/** Primary color of the falling elements (default: 'var(--primary)') */
	color?: string;
	/** Background color (default: 'var(--background)') */
	backgroundColor?: string;
	/** Speed reference in seconds; 120 matches the original 21st.dev pacing (default: 150) */
	duration?: number;
	/** Pattern density - affects spacing (default: 1) */
	density?: number;
};

// The 21st.dev original animated 36 background-position values from JS every
// frame under a full-size backdrop blur, which held the RSVP section near 9fps
// on a phone. Here the same streak columns sit on three tiles that only
// translate, so the browser moves them on the compositor with no repaints.
const TILE_W = 300;
const TILE_H = 400;

// Columns 25px apart; y is where each streak and its dot sit in the tile, and
// layer picks the speed the column fell at in the original (slow, mid, fast).
const COLUMNS = [
	{ y: 160, dot: 330, layer: 0 },
	{ y: 230, dot: 60, layer: 2 },
	{ y: 120, dot: 270, layer: 0 },
	{ y: 280, dot: 40, layer: 2 },
	{ y: 190, dot: 350, layer: 0 },
	{ y: 110, dot: 250, layer: 1 },
	{ y: 250, dot: 20, layer: 1 },
	{ y: 140, dot: 300, layer: 2 },
	{ y: 210, dot: 380, layer: 2 },
	{ y: 130, dot: 290, layer: 2 },
	{ y: 260, dot: 90, layer: 0 },
	{ y: 170, dot: 340, layer: 0 },
];

// Fall speeds in px/s at duration 120 (averages of the original columns)
const LAYER_SPEEDS = [47, 75, 128];

function layerImage(layer: number, color: string) {
	return COLUMNS.flatMap((c, i) => {
		if (c.layer !== layer) return [];
		const x = 2 + i * 25;
		return [
			`radial-gradient(4px 100px at ${x}px ${c.y}px, ${color}, transparent)`,
			`radial-gradient(1.5px 1.5px at ${(x + 150) % TILE_W}px ${c.dot}px, ${color} 100%, transparent 150%)`,
		];
	}).join(', ');
}

export function FallingPattern({
	color = 'var(--primary)',
	backgroundColor = 'var(--background)',
	duration = 150,
	density = 1,
	className,
}: FallingPatternProps) {
	const rootRef = useRef<HTMLDivElement>(null);

	// Off screen, stop the layers so the compositor can idle
	useEffect(() => {
		const root = rootRef.current;
		if (!root) return;
		const io = new IntersectionObserver(([entry]) => {
			root.dataset.paused = entry.isIntersecting ? 'false' : 'true';
		});
		io.observe(root);
		return () => io.disconnect();
	}, []);

	const scale = 120 / duration;

	return (
		<div
			ref={rootRef}
			data-paused="true"
			className={cn('group/fall relative h-full w-full overflow-hidden', className)}
			style={{ backgroundColor }}
		>
			{LAYER_SPEEDS.map((speed, layer) => (
				<div
					key={layer}
					aria-hidden="true"
					className="absolute inset-x-0 bottom-0 animate-falling-pattern will-change-transform group-data-[paused=true]/fall:[animation-play-state:paused] motion-reduce:animate-none"
					style={
						{
							top: -TILE_H,
							backgroundImage: layerImage(layer, color),
							backgroundSize: `${TILE_W}px ${TILE_H}px`,
							'--fall-distance': `${TILE_H}px`,
							animationDuration: `${TILE_H / (speed * scale)}s`,
						} as React.CSSProperties
					}
				/>
			))}
			{/* Static dot screen over the streaks: the original's LED look, minus its backdrop blur */}
			<div
				aria-hidden="true"
				className="absolute inset-0"
				style={{
					backgroundImage: `radial-gradient(circle at 50% 50%, transparent 0, transparent 2px, ${backgroundColor} 2px)`,
					backgroundSize: `${8 * density}px ${8 * density}px`,
				}}
			/>
		</div>
	);
}
