"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import { createTimeline, stagger, utils } from "animejs";

// Set the from-state before the browser paints, so nothing flashes visible
// first. Falls back to useEffect on the server, where layout effects do
// nothing and React warns about them.
const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

/**
 * Animates the hero on mount.
 *
 * The hidden starting state is applied from JavaScript, never from CSS. A CSS
 * rule would hide the hero in any browser that reports
 * `prefers-reduced-motion: no-preference` and then fails to run this script,
 * which is exactly the case a visitor with JavaScript disabled is in. Setting
 * the from-state here keeps the content readable by default, so the animation
 * only ever enhances a page that is already legible.
 */
export function HeroMotion({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useIsomorphicLayoutEffect(() => {
    const root = ref.current;
    if (!root) return;

    const targets = root.querySelectorAll<HTMLElement>("[data-anim]");
    if (targets.length === 0) return;

    // Leave the hero exactly as rendered for reduced-motion visitors.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    utils.set(targets, { opacity: 0, translateY: 28 });

    const timeline = createTimeline({
      defaults: { ease: "outExpo", duration: 700 },
    });

    timeline
      .add(targets, { opacity: [0, 1], translateY: [28, 0], delay: stagger(90) }, 0)
      .init();

    return () => {
      timeline.revert();
    };
  }, []);

  return <div ref={ref}>{children}</div>;
}
