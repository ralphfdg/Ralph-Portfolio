"use client";

import { useEffect, useLayoutEffect } from "react";

/**
 * `useLayoutEffect` warns on the server, where it never runs anyway. The client
 * branch is what matters: it applies the hidden state before the browser paints,
 * so a reveal never flashes its own starting position.
 */
const useIsomorphicLayoutEffect =
  typeof window === "undefined" ? useEffect : useLayoutEffect;

/**
 * One observer for every scroll reveal on the page. `Reveal` renders nothing; it
 * exists to add `js-reveal-ready` to the root element, which is what lets the
 * CSS apply a hidden state to `[data-reveal]` only once JavaScript is running.
 * Without that class the page is simply visible, so a reader without JavaScript
 * loses the animation and keeps the content.
 */
export function Reveal() {
  useIsomorphicLayoutEffect(() => {
    const root = document.documentElement;
    const targets = Array.from(
      root.querySelectorAll<HTMLElement>("[data-reveal]"),
    );

    // Nothing to observe. Leave the page alone rather than marking it ready and
    // hiding content that will never be revealed.
    if (targets.length === 0) return;

    root.classList.add("js-reveal-ready");

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add("is-revealed");
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
    );

    for (const target of targets) observer.observe(target);

    return () => {
      observer.disconnect();
      root.classList.remove("js-reveal-ready");
    };
  }, []);

  return null;
}
