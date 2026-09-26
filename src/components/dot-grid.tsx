"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { InertiaPlugin } from "gsap/InertiaPlugin";

export interface DotGridProps {
  className?: string;
  dotSize?: number;
  gap?: number;
  baseColor?: string;
  activeColor?: string;
  proximity?: number;
  shockRadius?: number;
  shockStrength?: number;
  returnDuration?: number;
}

type Rgb = { r: number; g: number; b: number };

type Dot = {
  /** Rest position, in CSS pixels. */
  x: number;
  y: number;
  size: number;
  /** 0 = resting colour, 1 = fully lit. Drives both mix and opacity. */
  alpha: number;
  /** Current displacement from rest, tweened by GSAP. */
  xOffset: number;
  yOffset: number;
  /** Whether the pointer is currently within `proximity` of this dot. */
  near: boolean;
};

const TAU = Math.PI * 2;
const MIN_ALPHA = 0.4;

/**
 * `hexToRgb` only understands 6-digit hex literals, so `baseColor` and
 * `activeColor` must be literals. A CSS custom property would parse to NaN and
 * silently produce a black grid.
 */
function hexToRgb(hex: string): Rgb {
  const bigint = parseInt(hex.replace("#", ""), 16);
  return {
    r: (bigint >> 16) & 255,
    g: (bigint >> 8) & 255,
    b: bigint & 255,
  };
}

/**
 * Leading-edge throttle with a trailing call, so the final pointer position
 * always lands: a leading-only throttle drops the last move of a gesture and
 * leaves dots stranded mid-follow until the next event.
 */
function throttle<A extends unknown[]>(
  fn: (...args: A) => void,
  wait: number,
): (...args: A) => void {
  let last = 0;
  let timer: ReturnType<typeof setTimeout> | null = null;
  let pending: A | null = null;

  return (...args: A) => {
    const now = performance.now();
    pending = args;

    if (now - last >= wait) {
      last = now;
      fn(...args);
      return;
    }

    if (timer) return;

    timer = setTimeout(() => {
      last = performance.now();
      timer = null;
      if (pending) fn(...pending);
    }, wait - (now - last));
  };
}

/**
 * Hero-only dot lattice, adapted from the React Bits `DotGrid`.
 *
 * Four departures from upstream, all of them load-bearing here:
 *
 * - The grid is decorative, so the root is `pointer-events: none` and can never
 *   intercept a click. The pointer effects are driven by a `window` listener
 *   that is gated to this canvas's bounding rect, which keeps the effect scoped
 *   to the hero without the hero's own content having to cooperate.
 * - Under `prefers-reduced-motion` the lattice draws exactly one static frame:
 *   no proximity response, no shockwave, and no `requestAnimationFrame` loop.
 *   Dots brightening around a cursor is motion even with no timeline.
 * - The redraw loop only runs while the hero is on screen, so scrolling past it
 *   stops the repaints instead of burning a frame budget on an invisible grid.
 * - Props are a deliberate subset of upstream's. `speedTrigger` and `maxSpeed`
 *   drive a cursor-speed response this grid does not want: the follow is a GSAP
 *   tween on the dot's x/y, so there is no velocity to accelerate and no
 *   `maxSpeed` ceiling to respect. `resistance` is still honoured, but only as
 *   `inertia` on the shockwave tween. Unused knobs on a public interface are
 *   worse than no knobs.
 */
export function DotGrid({
  className = "",
  dotSize = 32,
  gap = 16,
  baseColor = "#5227FF",
  activeColor = "#5227FF",
  proximity = 150,
  shockRadius = 250,
  shockStrength = 5,
  returnDuration = 1.5,
}: DotGridProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const root = rootRef.current;
    if (!canvas || !root) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Registered here rather than at module scope: the effect only ever runs on
    // the client, so the plugin never has to be safe during SSR module eval.
    gsap.registerPlugin(InertiaPlugin);

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const base = hexToRgb(baseColor);
    const active = hexToRgb(activeColor);

    let dots: Dot[] = [];
    let width = 0;
    let height = 0;
    let onScreen = true;

    const build = () => {
      dots = [];

      for (let y = gap / 2; y < height; y += gap) {
        for (let x = gap / 2; x < width; x += gap) {
          dots.push({
            x,
            y,
            size: dotSize * (0.6 + Math.random() * 0.8),
            alpha: MIN_ALPHA,
            xOffset: 0,
            yOffset: 0,
            near: false,
          });
        }
      }
    };

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      for (const dot of dots) {
        const t = dot.alpha;
        const r = Math.round(base.r + (active.r - base.r) * t);
        const g = Math.round(base.g + (active.g - base.g) * t);
        const b = Math.round(base.b + (active.b - base.b) * t);

        ctx.beginPath();
        ctx.arc(
          dot.x + dot.xOffset,
          dot.y + dot.yOffset,
          dot.size / 2,
          0,
          TAU,
        );
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${t})`;
        ctx.fill();
      }
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;

      // Capped at 2: these are 1–2px dots, so a 3x ratio triples the fill cost
      // for no visible gain.
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.floor(width * dpr));
      canvas.height = Math.max(1, Math.floor(height * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      build();
      draw();
    };

    // Redraw loop, gated on visibility. GSAP mutates the offsets outside React,
    // so something has to repaint while a tween is in flight.
    let frame = 0;
    let looping = false;

    const tick = () => {
      draw();
      if (onScreen) {
        frame = requestAnimationFrame(tick);
      } else {
        looping = false;
      }
    };

    const syncLoop = () => {
      if (onScreen && !looping) {
        looping = true;
        frame = requestAnimationFrame(tick);
      } else if (!onScreen && looping) {
        cancelAnimationFrame(frame);
        looping = false;
      }
    };

    const settle = (dot: Dot) => {
      dot.near = false;
      gsap.to(dot, {
        xOffset: 0,
        yOffset: 0,
        alpha: MIN_ALPHA,
        duration: returnDuration,
        ease: "power3.out",
        overwrite: "auto",
      });
    };

    /** Pointer position in canvas space, or null when the pointer is elsewhere. */
    const toLocal = (clientX: number, clientY: number) => {
      const rect = canvas.getBoundingClientRect();
      if (
        clientX < rect.left ||
        clientX > rect.right ||
        clientY < rect.top ||
        clientY > rect.bottom
      ) {
        return null;
      }
      return { x: clientX - rect.left, y: clientY - rect.top };
    };

    const onMove = (clientX: number, clientY: number) => {
      const point = toLocal(clientX, clientY);

      if (!point) {
        // Leaving the hero releases the grid rather than stranding lit dots
        // behind the fold.
        for (const dot of dots) if (dot.near) settle(dot);
        return;
      }

      for (const dot of dots) {
        const dx = point.x - dot.x;
        const dy = point.y - dot.y;
        const distance = Math.hypot(dx, dy);

        if (distance >= proximity || distance < 0.001) {
          if (dot.near) settle(dot);
          continue;
        }

        const scale = 1 - distance / proximity;
        dot.near = true;
        dot.alpha = MIN_ALPHA + scale * (1 - MIN_ALPHA);

        gsap.to(dot, {
          xOffset: dx * scale * 0.6,
          yOffset: dy * scale * 0.6,
          duration: 0.2,
          ease: "power2.out",
          overwrite: "auto",
        });
      }
    };

    const onClick = (event: MouseEvent) => {
      // Never fire the shockwave from a real control sitting over the grid.
      if ((event.target as HTMLElement | null)?.closest("a, button")) return;

      const point = toLocal(event.clientX, event.clientY);
      if (!point) return;

      for (const dot of dots) {
        const dx = dot.x - point.x;
        const dy = dot.y - point.y;
        const distance = Math.hypot(dx, dy);

        if (distance >= shockRadius || distance < 0.001) continue;

        // Divided by 10 because upstream's shockStrength is tuned for 16px dots;
        // at a 3px dot size the raw push flings the lattice off screen.
        const force = ((1 - distance / shockRadius) * shockStrength) / 10;

        gsap.to(dot, {
          xOffset: dx * force,
          yOffset: dy * force,
          // Object form, not `inertia: true`: the plugin reads `resistance` to
          // decide how long the flick runs, and letting it pick the duration is
          // the whole point of handing it the throw.
          inertia: { resistance: 750 },
          overwrite: "auto",
          onComplete: () => settle(dot),
        });
      }
    };

    resize();

    const viewport = new IntersectionObserver(
      ([entry]) => {
        onScreen = entry.isIntersecting;
        syncLoop();
      },
      { threshold: 0 },
    );
    viewport.observe(root);

    const observer = new ResizeObserver(resize);
    observer.observe(canvas);

    // Pointer tracking is skipped entirely under reduced motion, so the effect
    // is not merely drawn statically, it never responds.
    const throttledMove = reducedMotion
      ? null
      : throttle((event: PointerEvent) => onMove(event.clientX, event.clientY), 40);

    if (throttledMove) window.addEventListener("pointermove", throttledMove, { passive: true });
    if (!reducedMotion) window.addEventListener("click", onClick);

    if (!reducedMotion) syncLoop();

    return () => {
      viewport.disconnect();
      observer.disconnect();
      cancelAnimationFrame(frame);

      if (throttledMove) {
        window.removeEventListener("pointermove", throttledMove);
      }
      window.removeEventListener("click", onClick);

      for (const dot of dots) gsap.killTweensOf(dot);
    };
  }, [
    dotSize,
    gap,
    baseColor,
    activeColor,
    proximity,
    shockRadius,
    shockStrength,
    returnDuration,
  ]);

  return (
    <div
      ref={rootRef}
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 ${className}`}
    >
      <canvas ref={canvasRef} className="block size-full" />
    </div>
  );
}
