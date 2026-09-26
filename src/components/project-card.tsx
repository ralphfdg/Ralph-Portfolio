"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { animate, stagger, utils } from "animejs";

import type { Project, ProjectStatus } from "@/lib/content/schema";

/**
 * Badge text and colour both come from `status`, so colour is never the only
 * signal. Amber is reserved for incomplete work and appears nowhere else.
 */
const statusMeta: Record<ProjectStatus, { label: string; className: string }> = {
  live: {
    label: "Live",
    className: "border-accent text-accent-bright",
  },
  repo: {
    label: "Source only",
    className: "border-accent text-accent-bright",
  },
  private: {
    label: "Private repo",
    className: "border-line text-muted",
  },
  wip: {
    label: "In development",
    className: "border-ember text-ember",
  },
};

/**
 * anime.js owns transform, opacity and filter. Border and text colour stay with
 * CSS, so the two never write the same property and the card's existing
 * `hover:border-accent` keeps working alongside the animation.
 *
 * These are timings, not animation params. The params themselves are written
 * inline below so TypeScript can type the from/to tuples against
 * `AnimationParams`; hoisting them into a shared object makes them `readonly`
 * or widens them to `string`, and both are rejected.
 */
const IN_IMAGE_MS = 620;
const IN_REVEAL_MS = 520;
const IN_CARD_MS = 380;
const OUT_MS = 320;
const REVEAL_STAGGER_MS = 45;
const REVEAL_DIM = 0.55;
const REVEAL_RISE = 10;

export function ProjectCard({
  project,
  index,
  priority = false,
  variant = "standard",
}: {
  project: Project;
  /** Two-digit ordinal shown above the title, e.g. "01". */
  index: string;
  /** Set on the first card, whose screenshot is the page's LCP element. */
  priority?: boolean;
  /**
   * `feature` spans the full row and lays out horizontally from `md`, so the
   * first project gets a wide, poster-like tile and the rest stack beneath it.
   * That is the whole mosaic: one dominant tile, no masonry maths, and no
   * dependence on how many projects exist.
   */
  variant?: "feature" | "standard";
}) {
  const status = statusMeta[project.status];
  const cardRef = useRef<HTMLElement>(null);
  const isFeature = variant === "feature";

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    // Two guards, both load-bearing. The global reduced-motion rule in
    // globals.css only clamps CSS durations, and anime.js writes inline styles
    // from JavaScript, so it needs its own check. And a pointer that cannot
    // hover should not carry hover listeners at all.
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const canHover = window.matchMedia("(hover: hover)");
    if (reduced.matches || !canHover.matches) return;

    const image = card.querySelector<HTMLElement>("[data-hover='image']");
    const reveal = card.querySelectorAll<HTMLElement>("[data-hover='item']");
    if (!image || reveal.length === 0) return;

    let current: ReturnType<typeof animate>[] = [];

    const enter = () => {
      utils.remove(card.querySelectorAll("[data-hover]"));
      current = [
        animate(image, {
          scale: 1.08,
          filter: "brightness(1.12)",
          duration: IN_IMAGE_MS,
          ease: "outExpo",
        }),
        animate(card, { translateY: -4, duration: IN_CARD_MS, ease: "outQuint" }),
        animate(reveal, {
          opacity: [REVEAL_DIM, 1],
          translateY: [REVEAL_RISE, 0],
          duration: IN_REVEAL_MS,
          ease: "outExpo",
          delay: stagger(REVEAL_STAGGER_MS),
        }),
      ];
    };

    const leave = () => {
      utils.remove(card.querySelectorAll("[data-hover]"));
      current = [
        animate(image, {
          scale: 1,
          filter: "brightness(1)",
          duration: OUT_MS,
          ease: "outQuad",
        }),
        animate(card, { translateY: 0, duration: OUT_MS, ease: "outQuad" }),
        animate(reveal, {
          opacity: REVEAL_DIM,
          translateY: REVEAL_RISE,
          duration: 260,
          ease: "outQuad",
        }),
      ];
    };

    const onEnter = () => enter();
    const onLeave = () => leave();

    card.addEventListener("pointerenter", onEnter);
    card.addEventListener("pointerleave", onLeave);

    return () => {
      card.removeEventListener("pointerenter", onEnter);
      card.removeEventListener("pointerleave", onLeave);
      current.forEach((animation) => animation.revert());
      utils.remove(card.querySelectorAll("[data-hover]"));
    };
  }, []);

  return (
    <article
      ref={cardRef}
      className={`group flex flex-col border border-line bg-surface transition-colors hover:border-accent ${
        isFeature ? "md:col-span-2 md:flex-row" : ""
      }`}
    >
      {/* The frame takes its ratio from the project via `.shot-frame`, so a
          2.09 screenshot is not cropped down to 1.6. The feature tile drops the
          ratio from `md` up and takes half the width instead, so the image fills
          the height the text column sets rather than dictating it. */}
      <div
        className={`shot-frame relative overflow-hidden bg-accent-deep ${
          isFeature
            ? "shot-frame--feature border-b border-line md:w-1/2 md:shrink-0 md:border-r md:border-b-0"
            : "border-b border-line"
        }`}
        style={{ "--shot-aspect": project.screenshot.aspect } as React.CSSProperties}
      >
        <Image
          src={project.screenshot.src}
          alt={project.screenshot.alt}
          fill
          // `priority` is inert in this Next version, so the eager-loading hint
          // is set by hand. The feature tile carries the page's largest paint,
          // and without this the browser is free to promote a smaller card's
          // screenshot instead.
          loading={priority ? "eager" : "lazy"}
          fetchPriority={priority ? "high" : "auto"}
          // The feature tile's image is half the full row; a standard card's is
          // half of one column. The old single value under-described the
          // feature image, which is the one worth getting right.
          sizes={
            isFeature
              ? "(min-width: 768px) 50vw, 100vw"
              : "(min-width: 768px) 25vw, 100vw"
          }
          className="object-cover"
          data-hover="image"
        />
        <span
          className={`absolute left-4 top-4 border bg-surface-2/90 px-2.5 py-1 font-mono text-[0.625rem] uppercase tracking-[0.12em] ${status.className}`}
        >
          {status.label}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-6">
        <span className="font-mono text-xs text-muted" data-hover="item">
          {index}
        </span>
        <h3
          className="type-display mt-2 text-xl text-fg"
          data-hover="item"
        >
          {project.title}
        </h3>
        <p
          className="mt-2 flex-1 text-sm leading-relaxed text-muted"
          data-hover="item"
        >
          {project.hook}
        </p>

        <ul
          className="mt-5 flex flex-wrap gap-1.5"
          aria-label="Tech stack"
          data-hover="item"
        >
          {project.stack.map((item) => (
            <li
              key={item}
              className="border border-line px-2 py-0.5 font-mono text-[0.6875rem] text-muted"
            >
              {item}
            </li>
          ))}
        </ul>

        {/* Project links render only when there are any, so the card never
            ships a dead Live Demo or GitHub button. The case study always
            renders, because a detail page exists for every project. */}
        <div className="mt-6 flex flex-wrap items-center gap-4 border-t border-line pt-4">
          {project.links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="font-mono text-xs uppercase tracking-[0.12em] text-accent-bright underline-offset-4 hover:underline"
            >
              {link.label}
            </a>
          ))}
          <Link
            href={`/projects/${project.slug}`}
            className="ml-auto font-mono text-xs uppercase tracking-[0.12em] text-fg underline-offset-4 hover:text-accent-bright hover:underline"
          >
            Case study
          </Link>
        </div>
      </div>
    </article>
  );
}
