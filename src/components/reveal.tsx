"use client";

import { useEffect, useLayoutEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/**
 * `useLayoutEffect` warns on the server, where it never runs anyway. The client
 * branch is what matters: ScrollTrigger measures the document, so the triggers
 * have to exist before the browser paints or a reveal flashes its own starting
 * state.
 */
const useIsomorphicLayoutEffect =
  typeof window === "undefined" ? useEffect : useLayoutEffect;

/**
 * Where a reveal starts and ends, as a percentage of the viewport height
 * measured down from the top. The window is deliberately narrow so the scrub has
 * some travel to work with: an element stays hidden until its top reaches
 * `START`, and is fully revealed by the time its top reaches `END`.
 */
const REVEAL_START = 88;
const REVEAL_END = 55;

/** How far a hidden element sits below its resting place, in pixels. */
const REVEAL_RISE = 40;

/**
 * Drives every scroll-linked animation on the page: depth on the decorative
 * layers, and progress-bound reveals for the section blocks.
 *
 * Three decisions are load-bearing here.
 *
 * Everything scroll-driven lives inside one `matchMedia` context gated on
 * `no-preference`. Under `reduce` the function never runs, so no inline opacity
 * or transform is ever written and the content sits at its natural, visible
 * state. Nothing in CSS hides `[data-reveal]` any more, which makes this the
 * only thing between a reduced-motion reader and an invisible page — and it
 * fails safe, because no JavaScript also means no hidden state.
 *
 * A parallax rate moves the *wrapper*, never the animated child. The hero and
 * work glows drift on infinite `glow-drift-*` keyframes, and a running CSS
 * animation outranks an inline transform, so translating a glow directly would
 * be silently discarded. Moving the container and letting the children keep
 * drifting composes the two instead of fighting them.
 *
 * `data-reveal` belongs to this module alone. The project cards used to share the
 * attribute for their hover animation, which put two libraries on the same
 * `opacity` and `transform`; they own `data-hover` now.
 */
export function Reveal() {
  useIsomorphicLayoutEffect(() => {
    const root = document.documentElement;

    // Registered here rather than at module scope: the effect only ever runs on
    // the client, so the plugin never has to be safe during SSR module eval.
    gsap.registerPlugin(ScrollTrigger);

    const mm = gsap.matchMedia();

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      for (const el of root.querySelectorAll<HTMLElement>("[data-parallax]")) {
        const rate = Number.parseFloat(el.dataset.parallax ?? "");
        if (!Number.isFinite(rate) || rate === 0) continue;

        /*
         * The scope is what the layer travels across, and it has to be a real
         * ancestor. Every parallax target is an absolutely positioned
         * decoration, so measuring against the element itself would resolve to a
         * zero-length scroll range and leave it stuck at 0%.
         */
        const scope = el.closest<HTMLElement>("[data-parallax-scope]") ?? el;

        gsap.fromTo(
          el,
          { yPercent: 0 },
          {
            yPercent: rate,
            /* Linear is the point. A scrub maps scroll position to progress; an
               ease would make the layer lag behind the scroll and then catch up,
               which reads as the page fighting the reader. */
            ease: "none",
            scrollTrigger: {
              trigger: scope,
              start: "top bottom",
              end: "bottom top",
              scrub: true,
            },
          },
        );
      }

      for (const el of root.querySelectorAll<HTMLElement>("[data-reveal]")) {
        /*
         * A lag shifts the end of the window rather than delaying a tween.
         * "120ms later" means nothing once progress is bound to scroll distance,
         * so the stagger is re-expressed as distance: the spiral finishes its
         * reveal further down the viewport than the list beside it, which is
         * what the delay used to buy.
         */
        const lag = Number.parseFloat(el.dataset.revealLag ?? "0");
        const end =
          (Number.isFinite(lag) ? REVEAL_END + lag * (REVEAL_START - REVEAL_END) : REVEAL_END);

        gsap.fromTo(
          el,
          { opacity: 0, y: REVEAL_RISE },
          {
            opacity: 1,
            y: 0,
            ease: "none",
            scrollTrigger: {
              trigger: el,
              start: `top ${REVEAL_START}%`,
              end: `top ${end}%`,
              scrub: true,
            },
          },
        );
      }
    });

    /*
     * Webfonts land after first paint and change how tall everything below them
     * is, which leaves every trigger measured against a layout that no longer
     * exists. One refresh re-measures them against the real thing.
     */
    void document.fonts.ready.then(() => ScrollTrigger.refresh());

    return () => mm.revert();
  }, []);

  return null;
}
