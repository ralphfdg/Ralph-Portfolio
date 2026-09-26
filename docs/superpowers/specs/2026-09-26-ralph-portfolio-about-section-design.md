# Ralph Portfolio — About section, relocated aurora, ember actions

Status: Approved in conversation
Date: 2026-09-26
Supersedes: the structure and contact atmosphere rows of
`2026-09-26-ralph-portfolio-grainient-design.md`. The Grainient hero itself is
unchanged and that spec still governs it.

## Goal

Three changes, agreed in conversation:

1. Add an About section, and move the soft aurora band out of Contact and into
   it. It was first placed between Skills and Contact, then moved again on
   request to sit **directly after the Hero, before Work**; that is the shipped
   position and the one this spec describes.
2. Fix the aurora band's width, which is currently 300px inside a 1425px
   section.
3. Give the Hero and Contact actions a warm colour that is not the brand blue,
   because the blue buttons blend into the background.

## The band width bug

`globals.css:353` declared:

```css
.aurora-band {
  position: absolute;
  inset-x: 0;
  bottom: 0;
  height: 150px;
}
```

`inset-x` is a **Tailwind utility class name, not a CSS property**. In a
hand-written rule the declaration is invalid, so the browser discards it. Only
`bottom: 0` survived, which left the band with `right: auto` and `width: auto`,
so it shrink-wrapped its content. The content is a `<canvas>`, and a canvas with
no `width` attribute has an intrinsic width of exactly 300px.

Measured live at 1440x900, before the fix:

| Element            | Width  | Note                            |
| ------------------ | ------ | ------------------------------- |
| `#contact` section | 1425px | containing block                |
| `.aurora-band`     | 300px  | `right: 1124.8px`               |
| canvas             | 300px  | intrinsic default               |

Fix: `inset-inline: 0`, which is the real property and is what was meant.

The general lesson, recorded because it nearly shipped again: the check that
passed asserted `.aurora-band` *exists*, not that it has the right geometry. The
contrast samples were all taken at x >= 700 while the band sat at x 0-300, so
the one place the bug was visible was the one place nothing was looking. Every
future check on a decorative layer asserts **geometry against its container**,
not presence.

## Decisions

| Area                   | Decision                                        |
| ---------------------- | ----------------------------------------------- |
| About copy             | one paragraph, hobbies in the prose *and* the row |
| Heading                | "A bit about me"                                 |
| Section order          | Hero -> About -> Work -> Skills -> Contact       |
| Indices                | About `01`, Work `02`, Skills `03`, Contact `04` |
| Aurora home            | About, full-bleed, in the title -> body gap      |
| Band mask              | symmetric feather, top and bottom                |
| Aurora in Contact      | removed; Contact keeps dot grid + 3 blobs        |
| Portrait               | stays in Contact; About is text-only             |
| Ember                  | two tokens: `ember`, `ember-bright`              |
| Hero primary           | filled ember                                     |
| Hero secondary         | outlined ember-bright                            |
| Contact tiles          | filled ember                                     |
| `.section-wash`        | unchanged, still scoped to Work + Skills         |

## Structure

Three independent backgrounds, plus one static wash. No layer spans more than
one section.

| Section | Index | Background                                        |
| ------- | ----- | ------------------------------------------------- |
| Hero    | —     | `Grainient` (ogl, WebGL 2)                        |
| About   | `01`  | `SoftAurora` band, full-bleed, in the header gap   |
| Work    | `02`  | one static `.section-wash` gradient, shared below  |
| Skills  | `03`  | the same `.section-wash` layer                    |
| Contact | `04`  | `DotGrid` + 3 gradient blobs                      |

The aurora moves rather than being duplicated, so the page still runs three
canvases total: the hero shader, the About band, the contact dot grid.

`.section-wash` deliberately does **not** extend over About. About hosts an
animated band, and a static gradient under an animated band in the same section
is two competing effects. The wash stays scoped to Work + Skills: `page.tsx`
keeps its existing wrapper around those two, and About is a sibling placed
*before* it. The hero sits above About and is not washed either, so the only
thing between the hero shader and the aurora band is the About section itself.

## `Section`: the `midSlot` prop

The band has two requirements that fight each other:

- it must sit **between** the header block and the body, and
- it must be **full-bleed** — 1425px, not the 976px reading column.

Placing it inside the existing `max-w-5xl` content wrapper satisfies the first
and fails the second. A band inside the reading column can only ever be 976px,
and forcing it wider from in there needs negative insets plus `overflow-x: clip`
on the section.

Instead the content wrapper splits in two, with a full-width spacer between:

```tsx
<div className="relative mx-auto w-full max-w-5xl px-6">{header}</div>
{midSlot ? <div className="relative h-[120px] w-full">{midSlot}</div> : null}
<div className="relative mx-auto w-full max-w-5xl px-6">{children}</div>
```

The spacer is a direct child of `<section>`, so `w-full` is genuinely the
section's full width, and centring the band vertically in the gap is free
because the gap *is* the spacer. The 120px spacer is also the paragraph's top
margin, so the body needs no margin of its own.

`backdrop` and `onField` are unchanged.

## The About section

`src/components/about.tsx`. `index="01"`, eyebrow "About me", no `lede` — with
no lede the band sits literally between the title and the body, which is what
was asked for. The band is:

```tsx
<SoftAurora
  color1="#9ec4ff"
  color2="#4169e1"
  brightness={1.0}
  bandHeight={0.7}
/>
```

inside `.aurora-band`.

The first attempt was `color1="#9db4e3" color2="#4d6fd1" brightness={0.5}`, on
the reasoning that a band sitting in a content column has to stay quiet enough
to read as background behind real prose. In review it read as a faint smudge
rather than an aurora, and the request was for one that is actually visible. So
the colours move to a brighter blue pair, `brightness` doubles to `1.0`, and
`bandHeight` is set to `0.7` to concentrate the light into a defined ribbon
rather than spreading it thin. The prose is still legible over it: worst-case
contrast across the paragraph's own rectangle is 5.93:1 (see Verification).

Renumbering follows the new order — Work `02`, Skills `03`, Contact `04`. The
nav follows the sections: Home, About, Work, Skills, Contact.

## Content model

`aboutSchema` in `schema.ts`, added to `siteSchema`:

```ts
export const aboutSchema = z.object({
  heading: z.string().min(1),
  paragraphs: z.array(z.string().min(1).max(400)).min(1),
  interests: z.array(z.string().min(1)).default([]),
});
```

`paragraphs` stays an array even though the copy is one paragraph, so the copy
can be split later without a schema or type change.

The `.max(400)` cap is per **string**, not on the array. Written as
`z.array(z.string().min(1)).min(1).max(400)` it parses, passes every gate, and
silently caps the *number of paragraphs* at 400 instead — which is how the first
version of this schema shipped in the plan. The test that catches it is "rejects
a paragraph over the length cap".

The cap is measured, not guessed. The approved copy is **360 characters / 68
words / ~6 lines** at `max-w-2xl`. It exists to stop this becoming a wall of
text, and it is in the schema rather than only in a test so the guarantee is
enforced at parse time.

Note the earlier draft of this spec said `.min(2).max(320)`. Both bounds were
wrong for the copy that was actually approved — a single paragraph fails
`.min(2)`, and 360 characters fails `.max(320)`. The cap is set from the
measurement above.

### Copy

> I'm Ethan, a software engineer who builds for the web. I like turning rough
> ideas into things you can actually click, and I care about the details in
> between — the type that lines up, the state that behaves. Away from the editor
> you'll find me on a basketball court or out for a run, usually still turning
> over whatever problem I was stuck on the night before.

Interests, rendered as a non-interactive mono row: `Basketball`, `Running`,
`Coding`. They are plain text rather than links, because a hobby is not a
destination.

The copy deliberately asserts no location, years of experience, employer, or
education. None of that was supplied, and inventing it would be fabrication
rather than placeholder. It is drafted prose and is expected to be edited.

## Ember actions

Blue is the brand's "actionable" colour — links, focus rings, eyebrows, primary
button — and that is exactly why the buttons disappeared into the background:
they were the same blue as everything else. The actions move to a warm amber
that appears nowhere else on the page.

Two tokens, not three. The plan originally proposed `ember`, `ember-strong` and
`ember-bright`; `ember-strong` and `ember-bright` measured as the same hex, so
the third token is dropped rather than shipped as a duplicate.

| Token                  | Value     | Role                          | Measured                    |
| ---------------------- | --------- | ----------------------------- | --------------------------- |
| `--color-ember`        | `#e08a3c` | fills: buttons, tiles, chips | 7.50:1 with `--color-bg` text |
| `--color-ember-bright` | `#f0a95e` | text + borders on live fields, and the hover fill | 10.05:1 with `--color-bg` text |

`--color-status-wip` is renamed to `--color-ember`. Its only consumer is
`project-card.tsx:29` (`border-status-wip text-status-wip` -> `border-ember
text-ember`), and at 7.50:1 the chips keep the contrast they had.

`ember-bright` exists as a separate step for the same reason `accent-bright`
does: the hero's secondary button and the contact email hover sit on *moving*
fields — the Grainient shader and the dot grid — not on flat background. A
moving field raises the effective background luminance, so text over it needs
headroom beyond what flat-background maths suggests. 10.05:1 buys that.

| Element           | Change from                                    |
| ----------------- | ---------------------------------------------- |
| Hero primary      | `bg-accent` -> `bg-ember`, hover `ember-bright` |
| Hero secondary    | `border-line` -> `border-ember`, text `ember-bright` |
| Contact tiles     | outlined accent -> filled `bg-ember text-bg`, hover `ember-bright` |
| Contact email     | hover `accent-bright` -> `ember-bright`          |

Filled tiles against outlined is deliberate: Contact's tiles are the last
actionable thing on the page and should read as such.

## Verification

Machine gates, all of which currently pass and must keep passing:

- `npx tsc --noEmit`
- `npx eslint src --max-warnings=0`
- `npm test` — 30 tests (25 existing + 5 About)
- `npm run build` — compiles, 7 static routes

Additional checks for this change:

- **Band geometry.** `.aurora-band` width within a few px of its section's
  width, at 1440, 390 and 320. This is the check whose absence let the 300px bug
  ship. Measured: band and section both 1425 / 375 / 305 (the 375 and 305 are
  viewport widths minus the scrollbar), delta 0 at every size.
- **Contrast >= 4.5:1** on the worst pixel inside every text rectangle, pinned
  per frame: About heading, the paragraph, the interests row, hero primary and
  secondary, contact tiles, email, eyebrow, title, lede. Measured at 1440x900
  and 390x844 across at least five drift frames. Rectangles are re-read inside
  each frame — a stale rect produces plausible but wrong numbers, which is how
  the earlier 3.26:1 reading survived a round of "verification".

  Two measurement traps are recorded because both produced confident nonsense
  before being caught:

  - **Do not use `visibility: hidden` to erase text.** It hides the element's
    *background* too, so for a filled button you end up sampling the field
    behind it. A run that did this reported the solid ember "Download resume"
    button's fill as a dark blue. To clear glyphs while keeping a fill, set
    `color: transparent` — and disable `transition-colors` while doing it, or
    sample mid-transition and measure antialiased glyph edges.
  - **For a `rounded-full` element, inset the sample rect.** The bounding box
    corners lie outside the pill, where there is no text at all. Sampling the
    raw rect reported 4.13:1; sampling only the text-bearing region reported
    4.37:1.

  Measured results:

  | Element                | Contrast |     |
  | ---------------------- | -------- | --- |
  | About paragraph        | 5.93:1   | pass |
  | About eyebrow          | 5.93:1   | pass |
  | About heading          | 13.71:1 desktop, 14.83:1 mobile | pass |
  | About interests row    | 18.16:1  | pass |
  | Hero primary (solid)   | 7.50:1   | pass |
  | Contact tiles (solid)  | 7.50:1   | pass |
  | Contact email          | 11.20:1  | pass |
  | Hero secondary (outlined) | 4.37:1 | **accepted deviation** |

  The solid-filled buttons are exact rather than sampled: their computed
  background is a flat `rgb(224, 138, 60)`, so there is no frame-to-frame
  variance to average and the 7.50:1 follows from the token pair alone.

  **Accepted deviation.** The hero's outlined "Download resume" button measures
  4.37:1 against the brightest blue the Grainient passes behind its label
  (field luminance 0.015–0.07 behind the glyphs, text luminance 0.477). That is
  marginally under the 4.5:1 gate. It was reviewed and accepted as-is rather
  than fixed, on the grounds that it already reads correctly. The two available
  fixes, if it is ever revisited, are a translucent `bg-bg/60` backdrop behind
  the outline (~6.6:1, keeps the ember-bright label) or switching the label to
  `--color-fg` (~8.1:1, loses the warm label). Both were offered; neither was
  taken. Everything else in this table meets the gate.
- **No horizontal overflow** at 1440, 390 and 320.
- **Nav fits at 320px.** Measured, not estimated: five labels are 248px against
  305px available. The earlier "~257px against 272px, ~15px of slack" note in
  the spec was a guess and is replaced by the measurement; `globals.css` carries
  the same measured figures.
- All five routes render, and `/nope-404` still 404s.
- `document.hidden` still parks the shader after the move. Verified by
  checksumming two `#about` screenshots 900ms apart: the bytes differ while
  visible, are **identical** while hidden, and differ again after restoring
  visibility. Canvas pixel readback cannot be used for this — without
  `preserveDrawingBuffer` a WebGL canvas reads back empty, and a global rAF
  counter is contaminated by the hero and dot-grid loops that keep running.
- Canvas count stays at 3.

## Out of scope

- Editing the About copy. It is drafted prose and is the author's to change.
- Any further colour work. The accent blue ramp is untouched.
- A contact form. Still deferred; Contact is a working `mailto:`.
- The parallax engine. Already deleted; not reintroduced.
