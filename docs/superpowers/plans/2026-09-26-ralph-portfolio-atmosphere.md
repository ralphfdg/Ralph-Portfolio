# Ralph Portfolio — Content, Icon and Atmosphere Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Trim the skill set to 23 logo-backed skills, unify the section wording on "Work", warm the section copy, add motion, and give the hero a drifting blue gradient with a SoftAurora band replacing its bottom border.

**Architecture:** Content edits are pure data and are unit tested against the existing zod schema. The icon work is split between one inline-style change in the spiral and the SVG assets on disk, with a new Node test that reads the assets and proves every mark clears 3:1 against the card it sits on. Motion is CSS-first so it costs no JavaScript: the hero entrance is a keyframe with `animation-fill-mode: both`, and scroll reveals are a single client component that adds one class to `<html>` and lets CSS do the rest. SoftAurora is a self-contained client component adapted from React Bits to this codebase's accessibility conventions.

**Tech Stack:** Next.js 16.3.6, React 19.2.8, Tailwind CSS v4, TypeScript, Vitest 5, `ogl` (new), GSAP, Anime.js

**Spec:** `docs/superpowers/specs/2026-09-26-ralph-portfolio-atmosphere-design.md`

## Global Constraints

- Every JS-driven animation must honour `prefers-reduced-motion: reduce`. The existing global clamp in `globals.css` is not sufficient on its own for the WebGL band, which must stop its loop rather than merely shorten it.
- No content may be hidden by CSS alone. A reader without JavaScript must see every skill, every project, the full hero copy, and all section copy.
- Decorative layers take `pointer-events-none` and `aria-hidden`, and must never intercept a click.
- The hero's bottom `border-b` is removed and is not replaced by any other hard edge.
- Mark colour floor: every SVG in `public/logos` must clear **3:1** against the card fill `#17171c`. Three monochrome brands ship as `#F4F4F1` (the page's `--color-fg`, not pure white). Four dark-but-coloured brands ship hue-preserved: C# `#6949DA`, CSS3 `#7B50A7`, Flutter `#1B67A5`, SQLite `#3D6A7F`. The other 16 keep their exact Simple Icons hex.
- Skill marks are full-bleed: `width`/`height` `100%` of the card, no `padding`, no `backgroundColor`, no `boxSizing` override. The image keeps `borderRadius: cardRadius`. `overflow-hidden` must **not** be added to the card, because it would flatten the card's `transform-style: preserve-3d`.
- `getSkillMark`'s monogram fallback is **kept**, despite becoming unreachable for authored content.
- `enableMouseInteraction` is `false` on SoftAurora. `lightMode` is removed entirely: prop, uniform, and shader branch.
- Device pixel ratio is capped at `1.5` for the aurora.
- Section wording in visible copy uses **Work**. The identifiers `Projects`, `ProjectCard`, `Project`, `getFeaturedProjects`, and the route `/projects/[slug]` are all left alone.
- Test environment is pure Node: there is no `jsdom`, no testing-library, no react-test-renderer. Anything DOM-, WebGL- or CSS-shaped is verified in the browser, not by unit test. Do not add a DOM test dependency for this work.

---

### Task 1: Trim the skill set to 23

**Files:**
- Modify: `src/lib/content/schema.test.ts:119-145`
- Modify: `src/lib/content/site.ts:28-71`
- Modify: `src/lib/content/skill-marks.ts:20-55`

**Interfaces:**
- Consumes: nothing.
- Produces: `site.skills` with exactly 23 items across 4 groups; `skillMarks` with exactly 23 keys. Later tasks rely on the count being 23 and on the logo/monogram split described in Task 2.

- [ ] **Step 1: Write the failing test**

Add to the `skill marks` describe block in `schema.test.ts`:

```ts
  it("keeps the approved 23-skill set", () => {
    expect(everySkill, `expected 23 skills, got ${everySkill.length}`).toHaveLength(23);
  });

  it("has dropped the skills that have no brand mark", () => {
    const removed = ["SQL", "Azure Services"].filter((skill) =>
      everySkill.includes(skill),
    );
    expect(removed, `removed skills are back: ${removed.join(", ")}`).toEqual([]);
  });

  it("has no skill group left empty", () => {
    const empty = site.skills
      .filter((group) => group.items.length === 0)
      .map((group) => group.id);
    expect(empty, `empty groups: ${empty.join(", ")}`).toEqual([]);
  });
```

`everySkill` is already declared in that describe block at line 120, so it is in scope.

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test`
Expected: FAIL on "keeps the approved 23-skill set" with "expected 23 skills, got 25". The other two new tests pass already, which is expected — the third is a guard for the group removal below, and `skillGroupSchema` already enforces `items.min(1)`.

- [ ] **Step 3: Remove the two skills from the content**

In `site.ts`, delete `"SQL"` from the `languages` group:

```ts
    {
      id: "languages",
      label: "Languages",
      items: [
        "TypeScript",
        "JavaScript",
        "Python",
        "Java",
        "C#",
        "PHP",
        "HTML5",
        "CSS3",
      ],
    },
```

Delete the whole `cloud` group. `Azure Services` was its only member, so the group goes with it:

```ts
    {
      id: "cloud",
      label: "Cloud & Platforms",
      items: ["Azure Services"],
    },
```

The remaining groups are `languages` (8), `frameworks` (6), `backend` (4), `tools` (5) = 23.

- [ ] **Step 4: Remove the two marks**

In `skill-marks.ts`, delete these two lines:

```ts
  SQL: { kind: "monogram", label: "SQL" },
```

```ts
  // Cloud and platforms
  "Azure Services": { kind: "monogram", label: "AZ" },
```

Also update the file's header comment, which still explains the monogram in terms of the removed skills. Replace the paragraph beginning "A `monogram` is a letterform" with:

```ts
 * A `monogram` is a letterform in the site's own mono face. Every authored skill
 * currently resolves to a `logo`, so nothing renders as a monogram today; the
 * kind is kept so a skill added later without a mark still produces a readable
 * card rather than a blank one.
```

And update the first paragraph, which claims the SVGs are "rewritten to `fill="currentColor"`" and "read as one monochrome family". That is no longer true — the assets carry brand hex fills. Replace it with:

```ts
 * A `logo` is a self-hosted SVG in `public/logos`, fetched once at build time
 * and coloured to match the mark's own brand palette rather than the page's text
 * colour. Self-hosting means no runtime CDN request and no trademark hotlinking.
 * A test in `logo-colors.test.ts` proves every fill clears 3:1 against the card
 * it is drawn on.
```

- [ ] **Step 5: Run the test to verify it passes**

Run: `npm test`
Expected: PASS, 19 tests. Both the new count test and the pre-existing "has no marks for skills that were removed" test pass.

- [ ] **Step 6: Commit**

```bash
git add src/lib/content/site.ts src/lib/content/skill-marks.ts src/lib/content/schema.test.ts
git commit -m "feat: trim skills to the 23 that have a brand mark"
```

---

### Task 2: Full-bleed skill marks

**Files:**
- Create: `src/lib/content/logo-colors.test.ts`
- Modify: `src/components/infinite-spiral.tsx:305-321`
- Modify: `public/logos/next.js.svg`, `github.svg`, `express.js.svg`, `csharp.svg`, `css3.svg`, `flutter.svg`, `sqlite.svg`

**Interfaces:**
- Consumes: `public/logos` as 23 files named in `skill-marks.ts`, each with a `fill="#RRGGBB"` on the root `<svg>`.
- Produces: a card-filling mark. `logoStyle` keeps its current keys (`width`, `height`, `objectFit`, `filter`, `borderRadius`) so no caller changes; `SkillSpiral` needs no prop changes because it inherits `imageFit: "contain"`.

- [ ] **Step 1: Write the failing test**

Create `src/lib/content/logo-colors.test.ts`:

```ts
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * The skill cards are filled by the mark itself, so each SVG is drawn straight
 * onto the card. This proves the assets stay legible against that fill rather
 * than trusting a table of hexes maintained by hand.
 */
const LOGO_DIR = join(process.cwd(), "public", "logos");
const CARD_FILL = "#17171c";
const MIN_RATIO = 3;

function channel(value: number): number {
  const c = value / 255;
  return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

function luminance(hex: string): number {
  const h = hex.replace("#", "");
  return (
    0.2126 * channel(parseInt(h.slice(0, 2), 16)) +
    0.7152 * channel(parseInt(h.slice(2, 4), 16)) +
    0.0722 * channel(parseInt(h.slice(4, 6), 16))
  );
}

function contrast(a: string, b: string): number {
  const la = luminance(a);
  const lb = luminance(b);
  const [high, low] = la > lb ? [la, lb] : [lb, la];
  return (high + 0.05) / (low + 0.05);
}

const logos = readdirSync(LOGO_DIR).filter((file) => file.endsWith(".svg"));

function fillOf(file: string): string {
  const source = readFileSync(join(LOGO_DIR, file), "utf8");
  return /fill="(#[0-9a-fA-F]{6})"/.exec(source)?.[1] ?? "";
}

describe("skill logo assets", () => {
  it("ships one logo per authored skill", () => {
    expect(logos, `found ${logos.length} logos`).toHaveLength(23);
  });

  it("gives every logo an explicit hex fill", () => {
    const missing = logos.filter((file) => !/fill="#[0-9a-fA-F]{6}"/.test(fillOf(file)));
    expect(missing, `no hex fill: ${missing.join(", ")}`).toEqual([]);
  });

  it("keeps every mark legible on the card it is drawn on", () => {
    const tooDark = logos
      .map((file) => ({ file, ratio: contrast(fillOf(file), CARD_FILL) }))
      .filter((entry) => entry.ratio < MIN_RATIO)
      .map((entry) => `${entry.file} at ${entry.ratio.toFixed(2)}:1`);
    expect(
      tooDark,
      `below ${MIN_RATIO}:1 on ${CARD_FILL}:\n${tooDark.join("\n")}`,
    ).toEqual([]);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test`
Expected: FAIL on "keeps every mark legible", listing 7 files: `next.js.svg` at 1.18:1, `github.svg` at 1.00:1, `express.js.svg` at 1.11:1, `sqlite.svg` at 1.50:1, `css3.svg` at 2.12:1, `csharp.svg` at 2.25:1, `flutter.svg` at 2.39:1.

- [ ] **Step 3: Recolour the seven dark marks**

The fill attribute sits on the root `<svg>` element in each file. Replace the hex on that one attribute; leave the `d` path untouched.

| File | Replace | With | Why |
| --- | --- | --- | --- |
| `next.js.svg` | `#000000` | `#F4F4F1` | monochrome brand, dark-mode variant |
| `github.svg` | `#181717` | `#F4F4F1` | monochrome brand, dark-mode variant |
| `express.js.svg` | `#0A0A0A` | `#F4F4F1` | monochrome brand, dark-mode variant |
| `csharp.svg` | `#512BD4` | `#6949DA` | hue-preserving lift to 3:1 |
| `css3.svg` | `#663399` | `#7B50A7` | hue-preserving lift to 3:1 |
| `flutter.svg` | `#02569B` | `#1B67A5` | hue-preserving lift to 3:1 |
| `sqlite.svg` | `#003B57` | `#3D6A7F` | hue-preserving lift to 3:1 |

`#F4F4F1` is `--color-fg` rather than pure white, so those three read as the same warm paper-white as the page's text instead of brighter than it.

- [ ] **Step 4: Run the test to verify it passes**

Run: `npm test`
Expected: PASS, 22 tests. The legibility test now clears all 23.

- [ ] **Step 5: Remove the plate and make the mark fill the card**

In `src/components/infinite-spiral.tsx`, replace the whole `logoStyle` block at lines 305-321 with:

```ts
  const logoStyle: CSSProperties = {
    width: "100%",
    height: "100%",
    objectFit: imageFit,
    filter: `grayscale(${Math.min(1, Math.max(0, grayscale))})`,
    // The mark fills its card outright, so it is drawn straight onto the card
    // fill. Every asset is a square 24x24 viewBox and the cards are square, so
    // `contain` at 100% fills the card exactly: no padding, no letterboxing.
    // `borderRadius` is kept on the image rather than `overflow-hidden` on the
    // card, which would flatten the card's `preserve-3d`.
    //
    // The fills are not all legible on their own. Measured against #17171c,
    // Next.js (#000000) sat at 1.18:1, GitHub (#181717) and Express (#0A0A0A)
    // at about 1:1, SQLite at 1.50:1, CSS3 at 2.12:1, C# at 2.25:1 and Flutter
    // at 2.39:1. The three monochrome brands ship the white they use as their
    // own dark-mode logo and the other four are lifted along the line to white,
    // which preserves hue. `logo-colors.test.ts` holds all 23 above 3:1.
    borderRadius: cardRadius,
  };
```

The card keeps its `bg-surface-2`. It is now hidden behind the mark, and stays only so a failed image load shows a dark card rather than a hole.

- [ ] **Step 6: Update the comment above `itemClassName`**

The comment at lines 323-333 still describes a card "sized to leave room around a centred mark". Replace its first sentence:

```
  // Departures 3 and 4: a dark card with a hairline border, matching the page's
  // panel language, with the mark filling it edge to edge.
```

- [ ] **Step 7: Run the gate**

Run: `npm test`, then `npm run typecheck`
Expected: PASS, 22 tests, no type errors.

- [ ] **Step 8: Commit**

```bash
git add src/lib/content/logo-colors.test.ts src/components/infinite-spiral.tsx public/logos
git commit -m "feat: let skill marks fill their cards and clear 3:1 on the card fill"
```

---

### Task 3: Warm the copy and settle on "Work"

**Files:**
- Modify: `src/components/section.tsx:1-38`
- Modify: `src/components/projects.tsx:9-22`
- Modify: `src/components/skills.tsx:22`
- Modify: `src/components/contact.tsx:12-16`

**Interfaces:**
- Consumes: nothing.
- Produces: `Section` gains an optional `lede?: string` prop. Later tasks add `data-reveal` to the content each section renders; `lede` is rendered before `children` and must not carry a reveal attribute itself, so the section's content reveals as one block.

- [ ] **Step 1: Add the optional `lede` slot to `Section`**

In `section.tsx`, add `lede` to the destructure and the prop type, and render it between the title and `children`:

```tsx
export function Section({
  id,
  index,
  eyebrow,
  title,
  lede,
  children,
}: {
  id: string;
  /** Two-digit ordinal shown against the eyebrow, e.g. "02". */
  index: string;
  eyebrow: string;
  title: string;
  /** Optional supporting line, rendered under the title. */
  lede?: string;
  children: React.ReactNode;
}) {
```

and directly after the `</h2>`:

```tsx
        {lede ? (
          <p className="mt-4 max-w-2xl leading-relaxed text-muted">{lede}</p>
        ) : null}
```

- [ ] **Step 2: Retitle the Work section and fix its empty state**

In `projects.tsx`, change the `Section` call to:

```tsx
    <Section
      id="work"
      index="01"
      eyebrow="Selected work"
      title="My work"
      lede="Three builds, each one started because something about it annoyed me. Open any of them for the decisions behind the code, including the ones I would make differently."
    >
```

The existing comment on the `Section` line 9 is gone with the edit; do not re-add it.

The empty state still says "the stack below", which no longer matches anything now that the section is called My work and the next one is My skills. Change that paragraph to:

```tsx
          <p className="max-w-md text-sm leading-relaxed text-muted">
            Case studies are being written. In the meantime, the skills below and
            the contact details are the fastest way to see how I work.
          </p>
```

- [ ] **Step 3: Retitle the skills section**

In `skills.tsx`, change the `Section` call to:

```tsx
    <Section
      id="skills"
      index="02"
      eyebrow="Technical skills"
      title="My skills"
      lede="The tools I actually reach for, rather than an exhaustive list of everything I have opened once. The helix is this same list, turned."
    >
```

- [ ] **Step 4: Rewrite the contact section**

In `contact.tsx`, replace the `Section` call and the placeholder-framing paragraph with:

```tsx
    <Section
      id="contact"
      index="03"
      eyebrow="Contact me"
      title="Let's make magic together!"
      lede="Tell me what you are building and I will tell you honestly whether I can help. Email is the fastest way to reach me."
    >
```

Delete the `<p className="mt-6 ...">` block that follows it, which currently says the contact form is the next piece of work. The section's own `lede` replaces it, and the `mailto:` below stays.

Update the component's doc comment, which also refers to the deferred form, to:

```tsx
/**
 * The contact form is deferred to a later pass, so this renders a working
 * `mailto:` rather than a form that cannot submit anything. It exists so the
 * nav's `#contact` anchor and the Work section's fallback link both resolve
 * to something real.
 */
```

- [ ] **Step 5: Verify no visible "Projects" survives**

Run:

```bash
Select-String -Path src\components\*.tsx,src\app\**\*.tsx -Pattern '>Projects<|Projects</|"Projects"|Projects\b'
```

Expected: hits only in identifiers and comments — the `Projects` component name, `ProjectCard` imports, and comment prose. No rendered string. Confirm by loading the page and reading the section heading.

- [ ] **Step 6: Run the gate**

Run: `npm run typecheck`, then `npm run lint`
Expected: no errors. `lede` is optional, so no caller breaks.

- [ ] **Step 7: Commit**

```bash
git add src/components/section.tsx src/components/projects.tsx src/components/skills.tsx src/components/contact.tsx
git commit -m "feat: warm the section copy and settle on Work"
```

---

### Task 4: Scroll reveals

**Files:**
- Create: `src/components/reveal.tsx`
- Modify: `src/app/page.tsx:1-15`
- Modify: `src/app/globals.css` (append after the `.gooey-nav` block)
- Modify: `src/components/projects.tsx`, `src/components/skills.tsx`, `src/components/contact.tsx` (add `data-reveal`)

**Interfaces:**
- Consumes: `Section`'s children from Task 3.
- Produces: `Reveal`, a client component rendering `null`, mounted once in `page.tsx`. It adds the class `js-reveal-ready` to `document.documentElement` and toggles `is-revealed` on any element carrying `data-reveal`. CSS keys off exactly those two class names and the `--reveal-delay` custom property.

- [ ] **Step 1: Create the observer**

Create `src/components/reveal.tsx`:

```tsx
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
```

There is deliberately no "already run" ref guard. Under React strict mode the effect runs, cleans up, and runs again; the cleanup removes the class and disconnects, and the second run restores both, which is correct. A guard would let the cleanup win and leave the page permanently hidden.

- [ ] **Step 2: Mount it once**

In `src/app/page.tsx`:

```tsx
import { Contact } from "@/components/contact";
import { Hero } from "@/components/hero";
import { Projects } from "@/components/projects";
import { Reveal } from "@/components/reveal";
import { Skills } from "@/components/skills";

export default function Home() {
  return (
    <>
      <Reveal />
      <Hero />
      <Projects />
      <Skills />
      <Contact />
    </>
  );
}
```

- [ ] **Step 3: Add the CSS**

Append to `src/app/globals.css`, after the `.gooey-nav` block and before the `prefers-reduced-motion` block:

```css
/* Scroll reveals ------------------------------------------------------------ */
/* The hidden state is gated on `.js-reveal-ready`, which only `Reveal` adds. So
   a reader without JavaScript never gets a hidden element, and the content is
   in the markup regardless. */
.js-reveal-ready [data-reveal] {
  opacity: 0;
  transform: translate3d(0, 18px, 0);
  transition:
    opacity 700ms ease,
    transform 700ms cubic-bezier(0.16, 1, 0.3, 1);
  transition-delay: var(--reveal-delay, 0ms);
}

.js-reveal-ready [data-reveal].is-revealed {
  opacity: 1;
  transform: none;
}
```

The existing `prefers-reduced-motion` clamp drives `transition-duration` to `0.01ms`, so a reduced-motion reader sees the end state immediately rather than a fade. No extra rule is needed.

- [ ] **Step 4: Mark the reveal targets**

In `projects.tsx`, add the attribute to the grid:

```tsx
        <div className="mt-12 grid gap-6 md:grid-cols-2" data-reveal>
```

In `skills.tsx`, add it to the list column and to the spiral, staggered against each other. The delay goes in an inline custom property, because Tailwind cannot express an arbitrary `--reveal-delay` value in a class:

```tsx
        <div className="flex flex-col gap-8" data-reveal>
```

```tsx
        <div
          data-reveal
          className="h-full"
          style={{ "--reveal-delay": "120ms" } as React.CSSProperties}
        >
          <SkillSpiral items={spiralItems} />
        </div>
```

The wrapper is required because `SkillSpiral` takes no arbitrary props, and the cast is required because `React.CSSProperties` does not admit an unknown custom property. The `h-full` matters: this wrapper becomes the grid item, and `SkillSpiral`'s root resolves its own `h-full` against it, so without `h-full` the spiral frame would stop matching the list height on desktop. That height match was fixed earlier and this is the one change that would silently undo it.

In `contact.tsx`, add it to the link row:

```tsx
      <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3" data-reveal>
```

- [ ] **Step 5: Typecheck**

Run: `npm run typecheck`
Expected: no errors.

- [ ] **Step 6: Verify in the browser**

Run: `npm run dev`, then load `http://localhost:3000`.

- Scroll to each section and confirm content fades up once and stays visible.
- Reload scrolled to the bottom: nothing is stuck hidden.
- Disable JavaScript and reload: all three sections' content is visible, nothing is transparent. The skills spiral panel is expected to be empty, which is pre-existing behaviour.
- `Emulate` `prefers-reduced-motion: reduce`, reload: content appears immediately with no fade.
- In the console, confirm `<html>` carries `js-reveal-ready` only when JavaScript runs.

- [ ] **Step 7: Commit**

```bash
git add src/components/reveal.tsx src/app/page.tsx src/app/globals.css src/components/projects.tsx src/components/skills.tsx src/components/contact.tsx
git commit -m "feat: reveal sections on scroll without hiding content from no-JS"
```

---

### Task 5: Hero entrance and hover polish

**Files:**
- Modify: `src/app/globals.css` (append)
- Modify: `src/components/hero.tsx:19-46`
- Modify: `src/components/skills.tsx:39` (chip hover)
- Modify: `src/components/contact.tsx` (link transitions)

**Interfaces:**
- Consumes: nothing.
- Produces: `.rise-in` plus `.rise-in-1` through `.rise-in-4` in CSS, consumed by the hero's four copy elements.

- [ ] **Step 1: Add the entrance CSS**

Append to `src/app/globals.css`:

```css
/* Hero entrance ------------------------------------------------------------ */
/* Keyframes run from a hidden state to the natural one, so an animation that
   never runs leaves the copy exactly where the layout put it. `both` holds the
   `from` state through the stagger delay. */
@keyframes rise-in {
  from {
    opacity: 0;
    transform: translate3d(0, 14px, 0);
  }
  to {
    opacity: 1;
    transform: none;
  }
}

.rise-in {
  animation: rise-in 700ms cubic-bezier(0.16, 1, 0.3, 1) both;
}

.rise-in-1 { animation-delay: 60ms; }
.rise-in-2 { animation-delay: 150ms; }
.rise-in-3 { animation-delay: 240ms; }
.rise-in-4 { animation-delay: 330ms; }
```

- [ ] **Step 2: Apply it to the hero copy**

In `hero.tsx`, add the classes to the four copy elements. The eyebrow:

```tsx
        <p className="type-eyebrow rise-in rise-in-1 text-accent-bright">
          {site.title}
        </p>
```

The name:

```tsx
        <h1 className="type-display rise-in rise-in-2 mt-5 text-5xl leading-[0.95] text-fg md:text-7xl">
          {site.name}
        </h1>
```

The hook:

```tsx
        <p className="rise-in rise-in-3 mt-6 max-w-xl text-lg leading-relaxed text-muted">
          {site.hook}
        </p>
```

The pill row:

```tsx
        <div className="rise-in rise-in-4 mt-10 flex flex-wrap items-center justify-center gap-4">
```

- [ ] **Step 3: Polish hover on the chips and links**

In `skills.tsx`, give the chips a colour transition:

```tsx
                    className="border border-line px-2.5 py-1 font-mono text-xs text-fg transition-colors hover:border-accent hover:text-accent-bright"
```

In `contact.tsx`, add `transition-colors` to both link class strings:

```tsx
          className="font-mono text-sm text-accent-bright underline-offset-4 transition-colors hover:text-accent-strong hover:underline"
```

```tsx
            className="font-mono text-xs uppercase tracking-[0.12em] text-muted underline-offset-4 transition-colors hover:text-accent-bright hover:underline"
```

Both are colour-only. No hover rule may change layout, padding, or border width anywhere in this task.

- [ ] **Step 4: Verify in the browser**

- Load `http://localhost:3000` and confirm the hero copy rises in sequence.
- `Emulate` `prefers-reduced-motion: reduce`, reload: copy is fully visible immediately, no transform.
- Hover a chip, the email link, and a social link: colour changes, nothing reflows.
- Confirm the reduced-motion clamp did not strip the pill hovers into something unclickable.

- [ ] **Step 5: Commit**

```bash
git add src/app/globals.css src/components/hero.tsx src/components/skills.tsx src/components/contact.tsx
git commit -m "feat: add hero entrance and hover transitions"
```

---

### Task 6: SoftAurora component

**Files:**
- Modify: `package.json`, `package-lock.json`
- Create: `src/components/soft-aurora.tsx`

**Interfaces:**
- Consumes: `ogl` (`Renderer`, `Program`, `Mesh`, `Triangle`).
- Produces: `SoftAurora`, a default-exported client component. Props: `speed`, `scale`, `brightness`, `color1`, `color2`, `noiseFrequency`, `noiseAmplitude`, `bandHeight`, `bandSpread`, `octaveDecay`, `layerOffset`, `colorSpeed`, `enableMouseInteraction`, `mouseInfluence`. **No `lightMode`.** The root element is `pointer-events-none` and fills its parent. Task 7 supplies that parent.

- [ ] **Step 1: Install the dependency**

Run: `npm install ogl`
Expected: `ogl` added to `dependencies`, lockfile updated. `ogl` is a WebGL renderer with no React dependency, so nothing else moves.

- [ ] **Step 2: Create the component**

Create `src/components/soft-aurora.tsx`. This is the React Bits source with the eight changes noted inline:

```tsx
"use client";

import { Program, Mesh, Renderer, Triangle } from "ogl";
import { useEffect, useRef } from "react";

interface SoftAuroraProps {
  speed?: number;
  scale?: number;
  brightness?: number;
  color1?: string;
  color2?: string;
  noiseFrequency?: number;
  noiseAmplitude?: number;
  bandHeight?: number;
  bandSpread?: number;
  octaveDecay?: number;
  layerOffset?: number;
  colorSpeed?: number;
  enableMouseInteraction?: boolean;
  mouseInfluence?: number;
}

function hexToVec3(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  return [
    parseInt(h.slice(0, 2), 16) / 255,
    parseInt(h.slice(2, 4), 16) / 255,
    parseInt(h.slice(4, 6), 16) / 255,
  ];
}

const vertexShader = `
attribute vec2 uv;
attribute vec2 position;
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 0, 1);
}
`;

const fragmentShader = `
precision highp float;

uniform float uTime;
uniform vec2 uResolution;
uniform float uSpeed;
uniform float uScale;
uniform float uBrightness;
uniform vec3 uColor1;
uniform vec3 uColor2;
uniform float uNoiseFreq;
uniform float uNoiseAmp;
uniform float uBandHeight;
uniform float uBandSpread;
uniform float uOctaveDecay;
uniform float uLayerOffset;
uniform float uColorSpeed;
uniform vec2 uMouse;
uniform float uMouseInfluence;
uniform bool uEnableMouse;

#define TAU 6.28318

vec3 gradientHash(vec3 p) {
  p = vec3(
    dot(p, vec3(127.1, 311.7, 234.6)),
    dot(p, vec3(269.5, 183.3, 198.3)),
    dot(p, vec3(169.5, 283.3, 156.9))
  );
  vec3 h = fract(sin(p) * 43758.5453123);
  float phi = acos(2.0 * h.x - 1.0);
  float theta = TAU * h.y;
  return vec3(cos(theta) * sin(phi), sin(theta) * cos(phi), cos(phi));
}

float quinticSmooth(float t) {
  float t2 = t * t;
  float t3 = t * t2;
  return 6.0 * t3 * t2 - 15.0 * t2 * t2 + 10.0 * t3;
}

vec3 cosineGradient(float t, vec3 a, vec3 b, vec3 c, vec3 d) {
  return a + b * cos(TAU * (c * t + d));
}

float perlin3D(float amplitude, float frequency, float px, float py, float pz) {
  float x = px * frequency;
  float y = py * frequency;

  float fx = floor(x); float fy = floor(y); float fz = floor(pz);
  float cx = ceil(x);  float cy = ceil(y);  float cz = ceil(pz);

  vec3 g000 = gradientHash(vec3(fx, fy, fz));
  vec3 g100 = gradientHash(vec3(cx, fy, fz));
  vec3 g010 = gradientHash(vec3(fx, cy, fz));
  vec3 g110 = gradientHash(vec3(cx, cy, fz));
  vec3 g001 = gradientHash(vec3(fx, fy, cz));
  vec3 g101 = gradientHash(vec3(cx, fy, cz));
  vec3 g011 = gradientHash(vec3(fx, cy, cz));
  vec3 g111 = gradientHash(vec3(cx, cy, cz));

  float d000 = dot(g000, vec3(x - fx, y - fy, pz - fz));
  float d100 = dot(g100, vec3(x - cx, y - fy, pz - fz));
  float d010 = dot(g010, vec3(x - fx, y - cy, pz - fz));
  float d110 = dot(g110, vec3(x - cx, y - cy, pz - fz));
  float d001 = dot(g001, vec3(x - fx, y - fy, pz - cz));
  float d101 = dot(g101, vec3(x - cx, y - fy, pz - cz));
  float d011 = dot(g011, vec3(x - fx, y - cy, pz - cz));
  float d111 = dot(g111, vec3(x - cx, y - cy, pz - cz));

  float sx = quinticSmooth(x - fx);
  float sy = quinticSmooth(y - fy);
  float sz = quinticSmooth(pz - fz);

  float lx00 = mix(d000, d100, sx);
  float lx10 = mix(d010, d110, sx);
  float lx01 = mix(d001, d101, sx);
  float lx11 = mix(d011, d111, sx);

  float ly0 = mix(lx00, lx10, sy);
  float ly1 = mix(lx01, lx11, sy);

  return amplitude * mix(ly0, ly1, sz);
}

float auroraGlow(float t, vec2 shift) {
  vec2 uv = gl_FragCoord.xy / uResolution.y;
  uv += shift;

  float noiseVal = 0.0;
  float freq = uNoiseFreq;
  float amp = uNoiseAmp;
  vec2 samplePos = uv * uScale;

  for (float i = 0.0; i < 3.0; i += 1.0) {
    noiseVal += perlin3D(amp, freq, samplePos.x, samplePos.y, t);
    amp *= uOctaveDecay;
    freq *= 2.0;
  }

  float yBand = uv.y * 10.0 - uBandHeight * 10.0;
  return 0.3 * max(exp(uBandSpread * (1.0 - 1.1 * abs(noiseVal + yBand))), 0.0);
}

void main() {
  vec2 uv = gl_FragCoord.xy / uResolution.xy;
  float t = uSpeed * 0.4 * uTime;

  vec2 shift = vec2(0.0);
  if (uEnableMouse) {
    shift = (uMouse - 0.5) * uMouseInfluence;
  }

  float glow1 = auroraGlow(t, shift);
  float glow2 = auroraGlow(t + uLayerOffset, shift);
  vec3 gradient1 = cosineGradient(uv.x + uTime * uSpeed * 0.2 * uColorSpeed, vec3(0.5), vec3(0.5), vec3(1.0), vec3(0.3, 0.20, 0.20));
  vec3 gradient2 = cosineGradient(uv.x + uTime * uSpeed * 0.1 * uColorSpeed, vec3(0.5), vec3(0.5), vec3(2.0, 1.0, 0.0), vec3(0.5, 0.20, 0.25));

  vec3 col = 0.99 * glow1 * gradient1 * uColor1;
  col += 0.99 * glow2 * gradient2 * uColor2;

  col *= uBrightness;
  float alpha = clamp(length(col), 0.0, 1.0);
  gl_FragColor = vec4(col, alpha);
}
`;

export default function SoftAurora({
  speed = 0.6,
  scale = 1.5,
  brightness = 1.0,
  color1 = "#f7f7f7",
  color2 = "#e100ff",
  noiseFrequency = 2.5,
  noiseAmplitude = 1.0,
  bandHeight = 0.5,
  bandSpread = 1.0,
  octaveDecay = 0.1,
  layerOffset = 0,
  colorSpeed = 1.0,
  enableMouseInteraction = false,
  mouseInfluence = 0.25,
}: SoftAuroraProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    );

    // Change 1: dpr is capped. A full-width aurora at DPR 3 is a lot of
    // fragments for a decorative band.
    let renderer: Renderer;
    try {
      renderer = new Renderer({
        alpha: true,
        premultipliedAlpha: false,
        dpr: Math.min(window.devicePixelRatio || 1, 1.5),
      });
    } catch {
      // Change 2: no WebGL. The hero's CSS gradient carries the divider on its
      // own, and the band is decoration, so failing quietly is correct.
      return;
    }

    const gl = renderer.gl;
    gl.clearColor(0, 0, 0, 0);

    const geometry = new Triangle(gl);
    const program = new Program(gl, {
      vertex: vertexShader,
      fragment: fragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uResolution: { value: [1, 1, 1] },
        uSpeed: { value: speed },
        uScale: { value: scale },
        uBrightness: { value: brightness },
        uColor1: { value: hexToVec3(color1) },
        uColor2: { value: hexToVec3(color2) },
        uNoiseFreq: { value: noiseFrequency },
        uNoiseAmp: { value: noiseAmplitude },
        uBandHeight: { value: bandHeight },
        uBandSpread: { value: bandSpread },
        uOctaveDecay: { value: octaveDecay },
        uLayerOffset: { value: layerOffset },
        uColorSpeed: { value: colorSpeed },
        uMouse: { value: new Float32Array([0.5, 0.5]) },
        uMouseInfluence: { value: mouseInfluence },
        // Change 3: no uEnableMouse-driven listener wiring when disabled, and
        // no lightMode uniform at all.
        uEnableMouse: { value: enableMouseInteraction },
      },
    });

    const mesh = new Mesh(gl, { geometry, program });
    const canvas = gl.canvas;
    canvas.style.display = "block";
    container.appendChild(canvas);

    const resize = () => {
      const width = container.offsetWidth;
      const height = container.offsetHeight;
      if (width === 0 || height === 0) return;
      renderer.setSize(width, height);
      program.uniforms.uResolution.value = [
        canvas.width,
        canvas.height,
        canvas.width / canvas.height,
      ];
    };

    // Change 4: ResizeObserver instead of a window listener, so the band tracks
    // its own box rather than every resize on the page.
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);
    resize();

    let currentMouse = [0.5, 0.5];
    let targetMouse = [0.5, 0.5];
    let visible = true;
    let frame = 0;

    // Change 5: stop the loop when the band scrolls away. It is the second of
    // two live canvases on this page and it is decorative.
    const visibilityObserver = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
      },
      { threshold: 0 },
    );
    visibilityObserver.observe(container);

    function handleMouseMove(event: MouseEvent) {
      const rect = canvas.getBoundingClientRect();
      targetMouse = [
        (event.clientX - rect.left) / rect.width,
        1.0 - (event.clientY - rect.top) / rect.height,
      ];
    }

    function handleMouseLeave() {
      targetMouse = [0.5, 0.5];
    }

    if (enableMouseInteraction) {
      canvas.addEventListener("mousemove", handleMouseMove);
      canvas.addEventListener("mouseleave", handleMouseLeave);
    }

    function draw(time: number) {
      program.uniforms.uTime.value = time * 0.001;

      if (enableMouseInteraction) {
        currentMouse[0] += 0.05 * (targetMouse[0] - currentMouse[0]);
        currentMouse[1] += 0.05 * (targetMouse[1] - currentMouse[1]);
        program.uniforms.uMouse.value[0] = currentMouse[0];
        program.uniforms.uMouse.value[1] = currentMouse[1];
      }

      renderer.render({ scene: mesh });
    }

    function loop(time: number) {
      frame = requestAnimationFrame(loop);
      if (!visible) return;
      draw(time);
    }

    // Change 6: under reduced motion, render exactly one frame and never start
    // the loop. Not a hidden canvas and not a 0.01ms hack, which would still
    // leave a rAF running.
    if (reduceMotion.matches) {
      draw(0);
    } else {
      frame = requestAnimationFrame(loop);
    }

    return () => {
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      visibilityObserver.disconnect();
      if (enableMouseInteraction) {
        canvas.removeEventListener("mousemove", handleMouseMove);
        canvas.removeEventListener("mouseleave", handleMouseLeave);
      }
      if (canvas.parentNode === container) container.removeChild(canvas);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    };
  }, [
    speed,
    scale,
    brightness,
    color1,
    color2,
    noiseFrequency,
    noiseAmplitude,
    bandHeight,
    bandSpread,
    octaveDecay,
    layerOffset,
    colorSpeed,
    enableMouseInteraction,
    mouseInfluence,
  ]);

  // Change 7: the canvas can never intercept a click meant for the page.
  return <div ref={containerRef} className="pointer-events-none h-full w-full" />;
}
```

Four changes against the upstream source, recorded here so a later reader can tell them from upstream: `uResolution` is a `vec2` rather than a `vec3` (the third component was never read in the shader), `uLightMode` and its branch are gone, `enableMouseInteraction` defaults to `false`, and the container is `pointer-events-none`.

- [ ] **Step 3: Confirm the shader compiles**

Run: `npm run typecheck`
Expected: no errors. This checks types only; the shader compiles on the GPU, so it is confirmed in Task 7's browser pass.

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json src/components/soft-aurora.tsx
git commit -m "feat: add SoftAurora band adapted to the site's motion conventions"
```

---

### Task 7: Hero gradient, drifting glow, and the band

**Files:**
- Modify: `src/app/globals.css` (append)
- Modify: `src/components/hero.tsx:1-50`

**Interfaces:**
- Consumes: `SoftAurora` from Task 6.
- Produces: `.hero-gradient`, `.hero-glows`, `.hero-glow` with `--a`/`--b`/`--c` modifiers, and `.hero-aurora` for the masked band. All decoration sits inside one `absolute inset-0` wrapper so the copy is unambiguously above every canvas.

- [ ] **Step 1: Add the atmosphere CSS**

Append to `src/app/globals.css`:

```css
/* Hero atmosphere ---------------------------------------------------------- */
/* A static brand-blue wash. `accent-deep` at the top, falling to the page
   background. */
.hero-gradient {
  background:
    radial-gradient(
      120% 80% at 50% 0%,
      var(--color-accent-deep) 0%,
      transparent 62%
    ),
    linear-gradient(180deg, #0b0b0f 0%, var(--color-bg) 72%);
}

/* Three soft blobs drifting on offset cycles. Soft radial-gradient stops rather
   than blurred elements: a large animated `filter: blur()` makes the compositor
   re-rasterise a full-screen layer every frame, while a gradient gives the same
   soft edge for free. Durations are coprime-ish so the composition does not
   visibly loop. */
.hero-glows {
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
}

.hero-glow {
  position: absolute;
  border-radius: 9999px;
  will-change: transform;
}

.hero-glow--a {
  width: 44rem;
  height: 44rem;
  left: -12rem;
  top: -16rem;
  background: radial-gradient(
    circle,
    rgb(157 180 227 / 0.26) 0%,
    transparent 66%
  );
  animation: glow-drift-a 11s ease-in-out infinite;
}

.hero-glow--b {
  width: 38rem;
  height: 38rem;
  right: -12rem;
  top: 0;
  background: radial-gradient(
    circle,
    rgb(77 111 209 / 0.3) 0%,
    transparent 66%
  );
  animation: glow-drift-b 14s ease-in-out infinite;
}

.hero-glow--c {
  width: 34rem;
  height: 34rem;
  left: 50%;
  bottom: -12rem;
  margin-left: -17rem;
  background: radial-gradient(
    circle,
    rgb(107 138 222 / 0.24) 0%,
    transparent 68%
  );
  animation: glow-drift-c 8s ease-in-out infinite;
}

@keyframes glow-drift-a {
  0%,
  100% {
    transform: translate3d(0, 0, 0) scale(1);
  }
  50% {
    transform: translate3d(4rem, 3rem, 0) scale(1.08);
  }
}

@keyframes glow-drift-b {
  0%,
  100% {
    transform: translate3d(0, 0, 0) scale(1.05);
  }
  50% {
    transform: translate3d(-3.5rem, 2.5rem, 0) scale(1);
  }
}

@keyframes glow-drift-c {
  0%,
  100% {
    transform: translate3d(0, 0, 0) scale(1);
  }
  50% {
    transform: translate3d(2.5rem, -2.5rem, 0) scale(1.1);
  }
}

/* The band's top edge is masked so the canvas rectangle has no visible seam
   and the aurora appears to rise out of the page. */
.hero-aurora {
  -webkit-mask-image: linear-gradient(to top, #000 58%, transparent 100%);
  mask-image: linear-gradient(to top, #000 58%, transparent 100%);
}
```

The global `prefers-reduced-motion` clamp sets `animation-iteration-count: 1` and a `0.01ms` duration, so the blobs hold a static frame without any extra rule.

- [ ] **Step 2: Restructure the hero**

Replace the whole of `hero.tsx`. This is the post-Task-5 file, so the `rise-in` classes from that task are already present and must be carried over, not re-added:

```tsx
import { DotGrid } from "./dot-grid";
import SoftAurora from "./soft-aurora";
import { site } from "@/lib/content/site";

export function Hero() {
  return (
    <div id="top" className="relative overflow-hidden bg-bg">
      {/* Every decorative layer sits in one absolutely positioned wrapper, so
          the copy below is unambiguously above all of them and cannot be
          overlapped by a canvas that happens to be taller than expected. The
          lattice is decorative and the hero text stays real DOM text:
          selectable, and readable without canvas support. */}
      <div aria-hidden className="absolute inset-0">
        <div className="hero-gradient absolute inset-0" />
        <div className="hero-glows">
          <span className="hero-glow hero-glow--a" />
          <span className="hero-glow hero-glow--b" />
          <span className="hero-glow hero-glow--c" />
        </div>
        <DotGrid
          dotSize={3}
          gap={24}
          baseColor="#2A3350"
          activeColor="#9DB4E3"
          proximity={120}
        />
        {/* Replaces the hero's old border-b. Masked at the top edge so the
            canvas box has no seam. */}
        <div className="hero-aurora absolute inset-x-0 bottom-0 h-[150px]">
          <SoftAurora color1="#9db4e3" color2="#4d6fd1" />
        </div>
      </div>

      <div className="relative mx-auto flex w-full max-w-3xl flex-col items-center px-6 py-28 text-center md:py-36">
        <p className="type-eyebrow rise-in rise-in-1 text-accent-bright">
          {site.title}
        </p>

        <h1 className="type-display rise-in rise-in-2 mt-5 text-5xl leading-[0.95] text-fg md:text-7xl">
          {site.name}
        </h1>

        <p className="rise-in rise-in-3 mt-6 max-w-xl text-lg leading-relaxed text-muted">
          {site.hook}
        </p>

        {/* The two pills are the only rounded shapes on the site, kept as a
            deliberate organic note against the lattice and square cells. */}
        <div className="rise-in rise-in-4 mt-10 flex flex-wrap items-center justify-center gap-4">
          <a
            href="#work"
            className="rounded-full bg-accent px-6 py-3 font-mono text-xs uppercase tracking-[0.12em] text-bg transition-colors hover:bg-accent-strong"
          >
            View my work
          </a>
          <a
            href={site.resume.href}
            download={site.resume.filename}
            className="rounded-full border border-line px-6 py-3 font-mono text-xs uppercase tracking-[0.12em] text-fg transition-colors hover:border-accent hover:text-accent-bright"
          >
            Download resume
          </a>
        </div>
      </div>
    </div>
  );
}
```

Note what went: `border-b border-line`. Nothing replaces it. The hero's own `bg-bg` is also gone, because `.hero-gradient` now paints an opaque base; the page behind cannot show through either way, and two opaque backgrounds would be redundant.

- [ ] **Step 3: Run the gate**

Run: `npm run typecheck`, then `npm run lint`, then `npm run build`
Expected: no errors and a successful build. If the build warns about the WebGL import, stop and report it rather than suppressing it.

- [ ] **Step 4: Verify in the browser**

Run: `npm run dev`, load `http://localhost:3000`.

- The hero has a blue wash at the top and three soft blobs drifting at different rates. Watch for 10s and confirm they do not visibly loop together.
- The lattice is still visible and crisp above the glow.
- The hero's bottom edge has no hairline border and no visible canvas rectangle; the aurora fades upward into the page.
- `Emulate` `prefers-reduced-motion: reduce`, reload: blobs are static, the aurora renders one frame and is not animating, hero copy is fully visible.
- Count live canvases: expect 2 (the lattice and the aurora). Scroll past the hero and confirm the aurora's rAF stops.
- Force the WebGL-unavailable path by evaluating
  `HTMLCanvasElement.prototype.getContext = () => null` in the console before
  load, then reload: the hero must render on the CSS gradient alone with no error.
- Check the console is clean.

- [ ] **Step 5: Commit**

```bash
git add src/app/globals.css src/components/hero.tsx
git commit -m "feat: add drifting hero glow and SoftAurora divider"
```

---

### Task 8: Full gate and doc sync

**Files:**
- Modify: `docs/superpowers/specs/2026-09-26-ralph-portfolio-design.md`
- Modify: `docs/superpowers/plans/2026-09-26-ralph-portfolio-build.md`

**Interfaces:**
- Consumes: everything above.
- Produces: docs that match the built site.

- [ ] **Step 1: Run the full gate**

```bash
npm run typecheck
npm run lint
npm test
npm run build
git diff --check
```

Expected: all clean, 22 tests passing.

- [ ] **Step 2: Responsive sweep**

At 320, 375, 768, 1280 and 1920px, confirm no horizontal overflow at any width and that the skills spiral frame still matches the list height on desktop.

- [ ] **Step 3: Confirm the spiral renders 23 cards**

Load the page, let the spiral settle, and count the cards. Confirm 23, and that every mark is legible in situ with none rendering visibly small inside its card. Some Simple Icons paths do not reach their viewBox edge, and at full bleed that padding is obvious — this is the one thing only a human eye can settle.

- [ ] **Step 4: Sync the docs**

In `docs/superpowers/specs/2026-09-26-ralph-portfolio-design.md`, find the passage describing the skills spiral's marks, which still says the SVGs are rewritten to `fill="currentColor"` and read as one monochrome family, and that two skills fall back to monograms. Replace it with a note that the marks carry brand fills, that the three monochrome brands ship their dark-mode white, and that `logo-colors.test.ts` holds all 23 above 3:1 on `#17171c`.

Add a line to the same file's hero section recording that the bottom border was replaced by the SoftAurora band, and that a CSS gradient plus three drifting radial-gradient blobs now sit behind the lattice.

In `docs/superpowers/plans/2026-09-26-ralph-portfolio-build.md`, append a short addendum pointing at
`docs/superpowers/specs/2026-09-26-ralph-portfolio-atmosphere-design.md` and this plan, so the build log does not imply the spiral marks are still monochrome.

- [ ] **Step 5: Commit**

```bash
git add docs
git commit -m "docs: sync the design record with the atmosphere pass"
```
