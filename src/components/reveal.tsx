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
 *
 * It also tracks which way the page is scrolling and publishes it as
 * `data-scroll-dir` on the root, so a reveal can enter from the side the reader
 * is travelling towards. Direction is a live attribute rather than something
 * copied onto each element at reveal time: an element that has already revealed
 * sits at `transform: none` and does not care, and one still waiting is at
 * `opacity: 0` where its transform is invisible anyway.
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

    /* Direction, not magnitude. Only the sign of the delta is ever used, so the
       listener reads no layout and writes to the DOM only when the sign actually
       flips: a handful of times per page instead of once per scroll event. */
    let lastY = window.scrollY;
    const setDirection = (dir: "up" | "down") => {
      if (root.dataset.scrollDir !== dir) root.dataset.scrollDir = dir;
    };
    setDirection("down");

    const onScroll = () => {
      const y = window.scrollY;
      /* Sub-pixel deltas arrive from momentum scrolling and programmatic smooth
         scrolls. Reacting to them makes the direction flicker, and an element
         that happens to cross the threshold mid-flicker enters from the wrong
         side. */
      if (Math.abs(y - lastY) < 4) return;
      setDirection(y > lastY ? "down" : "up");
      lastY = y;
    };

    window.addEventListener("scroll", onScroll, { passive: true });

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
      window.removeEventListener("scroll", onScroll);
      observer.disconnect();
      root.classList.remove("js-reveal-ready");
      delete root.dataset.scrollDir;
    };
  }, []);

  return null;
}
