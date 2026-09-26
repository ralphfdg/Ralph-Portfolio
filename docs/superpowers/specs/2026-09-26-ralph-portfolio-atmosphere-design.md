# Ralph Portfolio — Content, Icon and Atmosphere Design

Date: 2026-09-26
Status: Approved
Supersedes nothing. Extends `2026-09-26-ralph-portfolio-design.md`, which remains
the record of the layout, colour and type system built in the previous pass.

> **Partly superseded for §5 and §6.** The hero ambience described below — the
> static gradient, the three drifting blobs, the `DotGrid` and the `SoftAurora`
> band (§5, §6) — no longer lives in the hero. The hero is now a single
> `Grainient` shader, and the dot grid, the aurora band and the blobs moved to
> the **contact** section, with Work and Skills reduced to one static wash. See
> `2026-09-26-ralph-portfolio-grainient-design.md`. The sections below are kept
> as the record of the decision at the time, including the reasoning that the
> later pass overturned; §1–§4 and §7 are unaffected and still describe the
> code as built.

## Goal

Seven changes, in the order they were requested:

1. Remove the skills that have no brand mark, so the spiral and the list are the
   same set and every card is a real logo.
2. Pick one word for the case-study section and use it everywhere.
3. Warm the section copy so it sounds like a person wrote it.
4. Add motion: hero entrance, scroll reveals, hover polish.
5. Give the hero a blue gradient with a slow drifting shimmer.
6. Replace the hero's bottom border with a SoftAurora band.
7. Let each skill logo fill its whole card, with no plate behind it.

Items 1 and 7 changed after review: item 1 originally proposed substituting
marks, and item 7 reverses the white plate added in the previous pass.

## Non-goals

- No layout change to the mosaic or the two-column skills row.
- No new section, no nav change, no footer.
- No change to the `mailto:` contact mechanism.
- No change to the project detail routes.

## 1. Skills

`SQL` and `Azure Services` are removed from `site.ts`. `Azure Services` is the
only member of the `Cloud & Platforms` group, so the group goes with it. 25
skills become 23, and the four remaining groups all stay non-empty.

`skill-marks.ts` loses the `SQL` and `Azure Services` entries. Every authored
skill now resolves to a `logo`, so the monogram branch in `getSkillMark` becomes
unreachable for real content. It is **kept** as a safety net for a future skill
authored without a mark, and the schema test keeps proving the two files agree.

Why these two and not others: both were standing in for skills with no mark, and
`Azure Services` was the only Azure entry, so keeping it would leave a group of
one for a service the rest of the site never mentions.

## 2. One word for the section

Visible copy uses **Work**. The section id stays `work`.

Unchanged on purpose, because renaming them is churn with no user-visible gain:

- `src/components/projects.tsx` and the `Projects` component
- `src/components/project-card.tsx` and `ProjectCard`
- `/projects/[slug]` and the `Project` type
- `getFeaturedProjects`

The nav already says "Work". The section heading was the last thing saying
"Projects" in visible text, plus one empty-state line referring to "the stack
below", which becomes "the skills below".

## 3. Warmer copy

Titles become personal; each section gains one supporting line that says
something rather than restating the heading.

`Section` gains an optional `lede` prop, rendered between the title and
`children`, at the muted colour already used for body copy. It goes in the shared
component rather than being repeated in each section's body: all three lines
want the same width, colour and spacing, and a shared prop is the only way to
guarantee that. Omit it and the section renders exactly as it does today.

| Section | Eyebrow | Title | Supporting line |
| --- | --- | --- | --- |
| 01 | Selected work | My work | Three builds, each one started because something about it annoyed me. Open any of them for the decisions behind the code, including the ones I would make differently. |
| 02 | Technical skills | My skills | The tools I actually reach for, rather than an exhaustive list of everything I have opened once. The helix is this same list, turned. |
| 03 | Contact me | Let's make magic together! | Tell me what you are building and I will tell you honestly whether I can help. Email is the fastest way to reach me. |

The contact line drops the "the contact form is the next piece of work" framing.
It is not a placeholder any more, so it should not read like one.

## 4. Motion

Three pieces, all of which must be invisible to a reader who does not want them.

**Hero entrance.** CSS only, no JavaScript. The copy starts displaced and
transparent and settles into its natural position, staggered by
`animation-delay` across the eyebrow, name, hook and pill row. It animates
*from* a hidden state *to* the natural state, so if the animation never runs the
copy is already where it belongs. A `prefers-reduced-motion` block already
clamps animation duration globally in `globals.css`; that covers this piece.

**Scroll reveals.** One client component mounted once in `src/app/page.tsx`. It
observes `[data-reveal]` elements and adds a revealed class when they enter the
viewport. The hidden state is applied by JavaScript, never by CSS alone, so a
no-JavaScript reader sees everything. Stagger within a group comes from a
`--reveal-delay` custom property on the elements. The observer is created in an
isomorphic layout effect so the first paint is already correct.

**Hover polish.** Skill chips, the email and social links, and the case-study
link get short colour and border transitions. Transitions only — no layout
changes on hover, so nothing reflows.

## 5. Hero gradient and shimmer

A static blue gradient layer on the hero, plus three soft blobs that drift
slowly on offset 8–14 second cycles.

The blobs are radial gradients, not blurred elements. A large animated
`filter: blur()` forces the compositor to re-rasterise a full-screen layer every
frame; radial-gradient stops give the same soft edge for free. The three blobs
move on different durations and starting offsets so the composition never
visibly loops.

Layer order inside the hero, back to front: gradient, blobs, `DotGrid`, copy,
SoftAurora band. The blobs sit below the lattice so the lattice stays crisp.

Colours come from the existing tokens: `accent-deep` as the base wash,
`accent` and `accent-bright` in the blobs.

## 6. SoftAurora band

The React Bits SoftAurora component, adapted to this codebase and installed as
`src/components/soft-aurora.tsx`. Requires `ogl`.

It replaces the hero's `border-b`. A full-height second canvas is not the goal;
the band is roughly the bottom 140–160px of the hero, masked at its top edge so
the canvas rectangle has no visible seam and the aurora appears to rise out of
the page rather than sit inside a box.

Defaults to change on the mount:

- `color1` → `--color-accent-bright` (`#9db4e3`)
- `color2` → `--color-accent` (`#4d6fd1`)

Conventions the upstream source does not already follow, and must:

1. `enableMouseInteraction={false}`. The band is decorative and sits in the hero's
   bottom edge; a cursor-reactive offset there would pull the aurora around as
   the reader moves toward the Work section, and the hero is not the mouse's
   focus.
2. `pointer-events-none` on the container, so the canvas can never intercept a
   click meant for the page.
3. Under `prefers-reduced-motion: reduce`, render exactly one frame and stop the
   animation loop. Not a hidden canvas, and not a `0.01ms` hack.
4. Stop the animation loop when the band scrolls out of view.
5. Cap device pixel ratio at `1.5`. A full-width aurora at DPR 3 is a lot of
   fragments for a decorative band.
6. `ResizeObserver` rather than a `window` resize listener, so the band tracks
   its own box.

Two departures from upstream, both deliberate:

- `lightMode` is dropped. The site is dark-only; the prop would be dead.
- WebGL creation is wrapped in a guard. If context creation throws, the band
  renders nothing and the hero falls back to the CSS gradient alone. It must not
  take the hero down with it.

## 7. Full-bleed skill marks

The white plate is removed. The mark fills its card.

`logoStyle` in `infinite-spiral.tsx` drops `boxSizing`, `padding` and
`backgroundColor`, and goes from `58%` to `100%` of the card. All 23 SVGs are
square 24×24 viewBoxes and the cards are square, so `objectFit: "contain"` at
100% fills the card exactly — no letterboxing, no padding.

`borderRadius: cardRadius` stays on the image so the square SVG's corners clip to
match the card. It is deliberately *not* done with `overflow-hidden` on the card,
which would flatten the card's `transform-style: preserve-3d`.

`SkillSpiral` passes `cardRadius` and `grayscale` but not `imageFit`, so it
inherits the `contain` default. No prop plumbing is needed.

The card keeps `bg-surface-2`. It is now hidden behind the mark, and stays only
so a failed image load shows a dark card rather than a hole.

### Mark colours

With the plate gone, the mark sits directly on `#17171c`. Three brands are
near-black and would have been invisible: Next.js `#000000` at 1.18:1, GitHub
`#181717` at 1.00:1, Express `#0A0A0A` at 1.11:1.

Blending toward white until each clears 3:1 was tested and rejected: those three
land on `#666`, `#656565` and `#666566` — three identical greys, which is worse
than either problem.

Instead, the three monochrome brands take the white those brands actually ship
as their dark-mode logo, and four dark-but-coloured brands get a lift along the
line to white, which preserves hue:

| Mark | Brand | Shipped as | Contrast |
| --- | --- | --- | --- |
| Next.js | `#000000` | `#f4f4f1` | 16.21:1 |
| GitHub | `#181717` | `#f4f4f1` | 16.21:1 |
| Express.js | `#0A0A0A` | `#f4f4f1` | 16.21:1 |
| C# | `#512BD4` | `#6949DA` | 3.03:1 |
| CSS3 | `#663399` | `#7B50A7` | 3.02:1 |
| Flutter | `#02569B` | `#1B67A5` | 3.00:1 |
| SQLite | `#003B57` | `#3D6A7F` | 3.03:1 |

The other 16 marks keep their exact Simple Icons hex and are untouched. All 23
clear 3:1, the WCAG 1.4.11 bar for a meaningful graphic.

`#f4f4f1` is `--color-fg`, not pure white, so the three dark-mode marks match the
page's warm paper-white rather than reading as brighter than the text.

## Verification

Gate, all currently green and re-run after the change:

```
npm run typecheck
npm run lint
npm test
npm run build
git diff --check
```

In the browser:

- Every mark legible in situ; all 23 clear 3:1 against the card behind it.
- No mark renders visibly small inside its card. Some Simple Icons paths do not
  reach their viewBox edge, and at full bleed that padding becomes obvious.
- Hero copy contrast holds over the brightest part of the shimmer.
- `prefers-reduced-motion: reduce`: no drifting blobs, no reveals, one static
  SoftAurora frame, hero copy fully visible.
- No JavaScript: every skill and project visible, hero copy visible, reveals not
  hiding anything. The skills panel is already expected to be empty without
  JavaScript.
- 320px to 1920px: no horizontal overflow.
- SoftAurora band has no visible canvas seam, and the hero's bottom border is
  gone.
- WebGL unavailable: hero renders on the CSS gradient alone.
- Console clean, including the LCP image warning fixed in the previous pass.

## Risks

- **Two live canvases.** `DotGrid` and SoftAurora both run at once. The band is
  short and offscreen-paused, but frame cost is worth watching.
- **The icon change is a large visual swing.** A mark goes from 58% to 100% of a
  92px card, roughly tripling its area, and every card becomes a solid colour
  block. This is the change most likely to need a second pass after it is seen
  rendered, which is why it is sequenced early.
- **SoftAurora is a fragment shader.** It is the one piece here that cannot be
  verified by reading the code.
