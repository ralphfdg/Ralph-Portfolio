"use client";

import { useEffect, useState } from "react";

// `Home` resolves to the hero, so the observer picks it up like any other
// target and the pill highlights it whenever the hero is the section in view.
const links = [
  { href: "#top", label: "Home" },
  { href: "#work", label: "Work" },
  { href: "#skills", label: "Skills" },
  { href: "#contact", label: "Contact" },
];

/**
 * Gooey section nav, scoped so its pill cannot leak onto other lists.
 *
 * The goo is an SVG displacement filter on the list itself, with each item
 * drawing a light `::after` pill beneath its label. Because the filter is
 * applied to the container, neighbouring pills merge rather than overlap.
 *
 * The socials sit outside the filtered list on purpose: putting them inside
 * would smear the goo across them too.
 */
export function GooeyNav() {
  const [active, setActive] = useState<string | null>(null);

  // Highlights the section currently in view, so the pill tracks the scroll.
  useEffect(() => {
    const sections = links
      .map((link) => document.getElementById(link.href.slice(1)))
      .filter((el): el is HTMLElement => el !== null);

    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (visible) setActive(visible.target.id);
      },
      { rootMargin: "-20% 0px -55% 0px", threshold: [0, 0.25, 0.5] },
    );

    for (const section of sections) observer.observe(section);

    return () => observer.disconnect();
  }, []);

  return (
    <>
      <svg aria-hidden="true" className="absolute size-0">
        <defs>
          <filter id="gooey-nav-filter">
            <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="blur" />
            <feColorMatrix
              in="blur"
              type="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 22 -9"
              result="goo"
            />
            <feBlend in="SourceGraphic" in2="goo" />
          </filter>
        </defs>
      </svg>

      <nav aria-label="Primary">
        <ul className="gooey-nav__list">
          {links.map((link) => (
            <li
              key={link.href}
              className="gooey-nav__item"
              data-active={active === link.href.slice(1)}
            >
              <a
                href={link.href}
                className="gooey-nav__link"
                aria-current={active === link.href.slice(1) ? "true" : undefined}
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </>
  );
}
