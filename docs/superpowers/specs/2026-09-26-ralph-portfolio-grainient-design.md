# Ralph Portfolio — Grainient hero, relocated atmosphere

Status: Approved in conversation
Date: 2026-09-26
Supersedes: the hero atmosphere section of
`2026-09-26-ralph-portfolio-atmosphere-design.md` §5 and §6, and the
atmosphere addendum in `2026-09-26-ralph-portfolio-design.md` lines 49–63.

## Goal

Three changes, agreed in conversation:

1. Centre the contact section's portrait, email and action tiles.
2. Move the dot grid, the soft aurora band and the gradient blobs out of the
   hero and into the contact section. Delete the duplicated copy that Work and
   Skills currently carry.
3. Replace the hero's own background with the React Bits `Grainient` shader,
   recoloured to the brand palette.

The performance goal is a consequence, not an extra requirement: collapsing
three parallel atmosphere systems into two, and collapsing the six animated
blobs into one shader, is what buys it.

## Structure

Two independent backgrounds. No layer spans more than one section.

| Section  | Background                                                       |
| -------- | ---------------------------------------------------------------- |
| Hero     | `Grainient` (ogl, WebGL 2)                                       |
| Work     | one static `.section-wash` gradient, shared with Skills          |
| Skills   | the same `.section-wash` layer                                   |
| Contact  | `DotGrid` + `SoftAurora` band + 3 gradient blobs                  |

Each decoration now exists exactly once and animates only while its own
section is on screen.

## `Grainient`

`src/components/grainient.tsx`. A port of the React Bits component, built on
`ogl` (already a dependency at `^1.0.11`; `SoftAurora` is the only current
importer).

### Colours

The three brand tokens map onto the shader's three stops directly:

| Prop     | Value     | Token                             |
| -------- | --------- | --------------------------------- |
| `color1` | `#9db4e3` | `--color-accent-bright`           |
| `color2` | `#4d6fd1` | `--color-accent`                  |
| `color3` | `#1c2547` | `--color-accent-deep`             |

`lightMode` is always false; the site is dark throughout.

### Starting props

`contrast 1.2`, `grainAmount 0.06`, `zoom 1.1`, `colorBalance 0`, everything
else at the upstream default. These are starting points, not decisions — they
get tuned in the browser against the two constraints in *Verification*.

### Departures from upstream

`SoftAurora` established six conventions for a WebGL component in this
codebase (see the atmosphere spec §6). `Grainient` adopts all of them.

1. **`isWebgl2` guard, before the `Program` is built.** This one is not
   optional. ogl's `Renderer` tries `webgl2` and silently falls back to
   `webgl` (`node_modules/ogl/src/core/Renderer.js:43-45`, exposing the result
   as `isWebgl2` at line 44). ogl's `Program` then passes the shader source
   through `shaderSource` verbatim (`Program.js:60`) with no `#version`
   injection and no GLSL 1 → 3 transpile. The upstream shaders declare
   `#version 300 es`, so on a WebGL 1 fallback they fail to compile and the
   hero renders as an empty box with only a `console.warn`. Checking
   `renderer.isWebgl2` first makes the failure deterministic and lets the
   hero's existing `bg-bg` carry the section instead.
2. **`prefers-reduced-motion` renders exactly one frame** and never starts the
   loop — not a hidden canvas, and not a `0.01ms` hack, which would still leave
   a rAF running.
3. **IntersectionObserver** pauses the loop when the hero scrolls away.
4. **`ResizeObserver`** on its own container rather than a window listener, so
   the shader tracks its own box.
5. **DPR capped at 1.5**, matching `SoftAurora`. This is a full-viewport
   fragment shader running three colour blends plus grain; DPR 3 is a lot of
   fragments for decoration.
6. **Fails quietly.** The `try`/`catch` around `new Renderer` stays, and the
   hero keeps `bg-bg` as the no-WebGL result.

Two further departures:

7. **`document.hidden` also pauses the loop.** Neither `SoftAurora` nor
   `DotGrid` does this today. A backgrounded tab still runs their rAF loops.
8. **The upstream two-effect split is kept.** Prop changes write uniforms and
   never rebuild the GL context, which is better than `SoftAurora`'s full
   teardown-and-recreate on every prop change.

`pointer-events-none` on the container and `WEBGL_lose_context` on cleanup are
carried over unchanged.

## Hero

`hero.tsx` keeps its shell: `min-h-svh`, `overflow-hidden`, the single
centred `max-w-3xl` copy column, and the `rise-in` entrance. `bg-bg` stays on
the wrapper, now as the no-WebGL fallback.

Everything inside the `aria-hidden` absolute layer goes: `.hero-gradient`,
`.hero-glows` and its three blobs, the `DotGrid`, and the `.hero-aurora` band.
`Grainient` replaces them as one child of that layer.

`data-parallax-scope` comes off the wrapper, because nothing inside it
carries a `data-parallax` rate any more.

## Contact

Two independent changes.

### Centering

The section was deliberately *not* centred, and the reasons are on record:

- `contact.tsx` rendered the portrait as a full-bleed left panel, rounded only
  on the open side, so the viewport-facing edge had no notch of background
  against the screen edge.
- `Section`'s `layout="split"` closed the `max-w-5xl px-6` wrapper before
  `children`, so the grid had no `mx-auto`, no `max-w-*` and no `px-*`. At
  1440 that put three different left edges on screen and left 464px of dead
  gutter beside the actions.

This change overturns that. The split *composition* — portrait beside actions
— is kept; the full-bleed is not.

- `layout="split"` is deleted from `Section`, along with the `children` escape
  hatch that made it possible. Contact was its only consumer.
- The grid inherits the normal `max-w-5xl px-6` reading column, so the
  portrait's left edge lines up with the section header's.
- The portrait becomes `rounded-3xl` on all four corners, and gains
  `mx-auto max-w-[360px]` so it centres on mobile. Its frame background
  changes from `bg-accent-deep` to `bg-surface-2`, because a solid
  `accent-deep` rectangle behind a now-transparent section reads as a hole
  during image load.
- The actions column gains `items-center text-center`. It already had
  `justify-center`, which on a `flex-col` centres the *vertical* axis and does
  nothing horizontally — the reason the content looked left-aligned.
- The email and the three tiles gain `text-center`; the tiles also gain
  `mx-auto` so their borders shrink-wrap instead of stretching.

### Background

Contact gains one `aria-hidden` absolute layer, mirroring the arrangement the
hero used to have: three gradient blobs, the dot grid, and the aurora band at
the section's bottom, masked at the top edge so it rises out of the page
rather than showing the canvas rectangle.

- The blobs reuse the existing `@keyframes glow-drift-a/b/c` and
  `rgb(157 180 227 / …)`, `rgb(77 111 209 / …)`, `rgb(107 138 222 / …)`.
  Same palette, same drift, so the two decorated sections read as one system.
- `.hero-aurora` is renamed `.aurora-band` rather than duplicated, since it now
  has one consumer.
- The `DotGrid` keeps the hero's exact props: `dotSize 5`, `gap 18`,
  `baseColor #2A3350`, `activeColor #9DB4E3`, `proximity 140`.

## `Section`

`tone="brand"` currently paints `bg-accent-deep` on the section. That fill has
to go, or it hides the very blobs it exists to colour. What survives is the
text treatment — `text-accent-bright` for the eyebrow and lede,
`border-accent/50` for the hairline — which is now *safer* than before.

The doc comment's reasoning inverts and is rewritten accordingly. It argued
that `brand` had to paint a fill because `--color-muted` is 4.43:1 on
`accent-deep`, just under AA. On a dark blob field `accent-bright` clears AA
with room to spare, so the text treatment is now doing the accessibility work
on its own and the fill is redundant.

`layout` loses the `split` variant. `contained` becomes the only value, which
means the prop itself is redundant — it is left in place as a single-variant
union rather than removed, so the section API does not change shape.

## Work and Skills

`.work-glows` and its three blobs are deleted outright, not replaced with an
animated equivalent. The middle of the page gets one `.section-wash` layer: a
static `radial-gradient` in `--color-accent-deep` over `--color-bg`, masked at
both ends so it fades in under the hero and back out before the contact
section. No animation, no `will-change`, no keyframes — one composited layer
and zero per-frame cost.

`page.tsx` keeps its `relative` wrapper, which is what gives the wash a
positioning context, and loses `data-parallax-scope`.

## Performance

The wins, and where each comes from:

| Change                                                          | Effect                                       |
| --------------------------------------------------------------- | -------------------------------------------- |
| 6 animated blobs → 3                                            | half the largest animated surfaces            |
| 6 blobs → one shader-driven gradient                            | one draw call instead of six composited layers |
| 2 × `will-change: transform` → 0                                | two fewer promoted layers                     |
| `.work-glows` deleted                                           | Work and Skills stop animating entirely       |
| 6 infinite keyframe animations → 3                              | three fewer running animations                |
| `document.hidden` pausing on all three live canvases            | no GPU work in a backgrounded tab             |
| DPR 1.5 on the new full-viewport shader                         | bounded fragment count                        |

The design record's standing risk was "two live canvases". That is now three
components but never more than one drawing: `Grainient` runs only while the
hero is on screen, and `DotGrid` and `SoftAurora` only while Contact is.

## Dead code removed

- `reveal.tsx`'s `[data-parallax]` loop. All four `data-parallax` targets
  lived in the hero and work-glow layers this change deletes
  (`hero.tsx:23,24,29,40`, `page.tsx:18`), so the loop, the
  `data-parallax-scope` fallback and both `data-parallax-scope` attributes
  have no remaining consumer. The `[data-reveal]` loop is untouched; it has
  four live users.
- `.hero-gradient`, `.hero-glows`, `.hero-glow--a|b|c`, `.work-glows`,
  `.work-glow--a|b|c`. `@keyframes glow-drift-a/b/c` are **kept** — the
  contact blobs use them.

## Testing

None, and that is deliberate. The suite is pure-Node vitest
(`environment: 'node'`, `include: ['src/**/*.test.ts']`) with no jsdom and no
testing-library, and
`docs/superpowers/plans/2026-09-26-ralph-portfolio-atmosphere.md:25` states
outright: *"Do not add a DOM test dependency for this work."* A shader and a
canvas layout cannot be verified by reading code. Both existing suites
(`schema.test.ts`, `logo-colors.test.ts`) cover content, not components, and
must simply stay green.

Gates: `lint`, `typecheck`, `test`, `build`.

## Verification

- 320 → 1920, no horizontal overflow at any width.
- Hero copy (`#f4f4f1` and `#8b8b95`) stays ≥ 4.5:1 over the *brightest* pass
  of the Grainient field, at every width.
- Contact's eyebrow, lede and hairline stay ≥ 4.5:1 over the contact blobs.
- The `Grainient` field does not band or posterize at 1920.
- `prefers-reduced-motion`: no drifting blobs, no reveals, one static
  `Grainient` frame, one static aurora frame, and no rAF running.
- No JavaScript: all content visible.
- WebGL unavailable: the hero falls back to `bg-bg`; the contact blobs and dot
  grid still render, being CSS and 2D canvas.
- `/projects/[slug]` renders `Contact` too, so it inherits the new background.
- Clean console.

## Risks

- **The `#version 300 es` guard is the whole ballgame.** Miss the `isWebgl2`
  check and the hero is a black box on any WebGL 1 browser, which is close to
  unobservable locally. If the shader does misbehave, the escape hatch is to
  port it to GLSL ES 1.00 the way `soft-aurora.tsx` already is — `in` →
  `attribute`, `out vec4 fragColor` → `gl_FragColor`, drop `#version` — which
  costs the `mainImage` signature and nothing else.
- **`Grainient` is a fragment shader and cannot be verified by reading it.**
  Inherited from the atmosphere spec's standing risk; the only answer is the
  browser sweep.
- **The middle of the page loses its animation.** Work and Skills go from
  drifting colour to a static wash. That is the deliberate cost of deleting
  three animations.
