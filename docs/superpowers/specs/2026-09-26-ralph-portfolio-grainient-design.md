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

**The palette shipped is violet and deliberately sits outside the brand ramp.**
The original three-stop mapping below was the starting point and is kept here
because the reasoning that displaced it is the useful part:

| Prop     | Starting value | Token                             |
| -------- | -------------- | --------------------------------- |
| `color1` | `#9db4e3`      | `--color-accent-bright`           |
| `color2` | `#4d6fd1`      | `--color-accent`                  |
| `color3` | `#1c2547`      | `--color-accent-deep`             |

That ramp is slate blue, and slate blue at these luminances is very nearly
grey. The first live pass measured a median chroma of 42/255 and a median
luminance of 0.0056 — the field read as black with a blue cast, not as colour.
Re-running the ramp search for a violet put the shipped values on the same
`color1 > color2 > color3` ordering:

| Prop     | Shipped value | Note                                    |
| -------- | ------------- | --------------------------------------- |
| `color1` | `#5a34c0`     | mid violet, does the actual colouring   |
| `color2` | `#2a1c7d`     | deep indigo                             |
| `color3` | `#0b0826`     | near-black violet, the shadow end        |

`gamma` is `1.05`, i.e. very nearly untouched. That is a considered choice: the
upstream default is `0.3`, and any gamma below 1 crushes the midtones toward
black, which is the exact failure being fixed. Leaving the ramp alone and
letting the hues carry the colour is what moved median luminance 7x.

A bluer ramp was also measured and scored higher on raw chroma (164 against
138), but its red channel sat at 6/255, which reads as neon against near-black.
The violet keeps some warmth. This is a judgement call, not a measurement.

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
- `min-h-[280px] md:min-h-[420px]` becomes `aspect-[6/7]`. The source portrait
  is 1716×1748, so a fixed ratio crops the same slice the old 360×420 box did,
  but it stays true when the column is narrower than 360px — under `min-h` the
  image grew to fill whatever height the row happened to take.
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

- The blobs reuse the (renamed) `@keyframes blob-drift-a/b/c` and
  `rgb(157 180 227 / …)`, `rgb(77 111 209 / …)`, `rgb(107 138 222 / …)`.
  Same palette, same drift, so the two decorated sections read as one system.
- `.hero-aurora` is renamed `.aurora-band` rather than duplicated, since it now
  has one consumer.
- The `DotGrid` keeps the hero's exact props: `dotSize 5`, `gap 18`,
  `baseColor #2A3350`, `activeColor #9DB4E3`, `proximity 140`.
- The blobs paint **before** the dot grid, not after. They are soft translucent
  gradients, so anything beneath them loses contrast, and these dots brighten on
  pointer proximity; the grid has to stay on top for the interaction to read.

## `Section`

Both `tone` and `layout` are **removed outright**, not narrowed. `Contact` was
their only consumer, so keeping them as single-variant unions would have left two
props whose only legal value was the default — noise with no second caller to
justify it. The section API gains one prop in exchange:

| Prop       | Shape            | Why                                                        |
| ---------- | ---------------- | ---------------------------------------------------------- |
| `backdrop` | `React.ReactNode` | decorative layers, rendered outside the reading column so they can run to the section's edges |
| `onField`  | `boolean`        | the backdrop is a *moving* field, so the supporting text needs the brighter muted token |

The backdrop wrapper is `aria-hidden`, `pointer-events-none` and clips its own
overflow. Clipping there rather than on the `<section>` is deliberate: making
the section `overflow-hidden` would turn it into a scroll container and break
`position: sticky` for anything nested inside it. The content wrapper keeps
`relative` so the copy wins the paint order against an absolutely positioned
backdrop.

### `onField`, and why the eyebrow and lede had to move

`tone="brand"` existed to paint `bg-accent-deep`, and its doc comment explained
that the fill was load-bearing: `--color-muted` is 4.43:1 on `accent-deep`,
just under AA. Removing the fill without moving the text **looked** safe and was
not — it was a real regression, caught by measurement rather than by reading the
code.

With the fill gone, Contact's copy sits on the dot lattice plus drifting blobs.
Those push the local background to roughly `rgb(50,58,77)`, and `--color-muted`
fell to **3.26:1** on the eyebrow and **3.37:1** on the lede. Both fail AA.

The fix is the same one the hero hook already uses, for the same reason: text on
a moving field uses `--color-muted-bright` (`#c2c4cd`). `onField` is that
decision expressed once, in the component that owns the header, instead of a
colour passed in per section.

| Run                   | Eyebrow | Lede  |
| --------------------- | ------- | ----- |
| `text-muted`, measured | 3.26:1  | 3.37:1 |
| `text-muted-bright`    | 5.85:1  | 5.95:1 |

`border-accent/50` becomes `border-line` for the hairline, which is a real
regression against a blob field and had to go. `index` and `title` are
untouched: the numeral is already `text-accent-bright` and the title is
`text-fg`, and both clear AA on this background unaided.

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
- `.hero-gradient`, `.hero-glows`, `.hero-glow--a|b|c`, `.hero-aurora`,
  `.work-glows`, `.work-glow--a|b|c`. `@keyframes glow-drift-a/b/c` are **renamed**
  to `blob-drift-a|b|c` rather than kept: `glow` named a section that no longer
  exists, and with Work and Skills now static the contact blobs are their only
  consumer.

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

**The contrast criterion is per text rectangle, not whole-field.** An earlier
draft of this spec set a global field p99 luminance target, which cannot survive
a decision to make the field colourful: a bright field is the point. What is
actually asserted is that every run of text clears AA against the *worst pixel
inside its own bounding rect*, sampled across viewports and across the drift
cycles. The field's own median/p99 luminance is recorded as a description of
the look, not as a gate.

Method: hide the text with `color: transparent` (layout-preserving, so the rect
still marks where the glyphs sit), screenshot, then decode the PNG and take the
worst ratio over every pixel of each rect. Two traps worth recording, both of
which produced false results first:

- The scroll offset must be pinned and re-checked per frame. `scrollIntoView`
  plus smooth scrolling left the rects describing a *previous* scroll position,
  and the samples landed on the portrait — a false 1.39:1 "failure" that was
  really a bright JPEG.
- A short viewport cannot scroll far enough to centre a last-section element.
  Those need `fullPage` capture with page coordinates, not viewport ones.

Results, worst pixel per rect:

| Run                | Size / weight | Worst   | Need  | |
| ------------------ | ------------- | ------- | ----- | --- |
| Hero eyebrow       | 11px / 500    | 4.75:1  | 4.5:1 | pass |
| Hero `h1`          | 36–72px       | 8.14:1  | 3:1   | pass |
| Hero hook          | 18px          | 6.47:1  | 4.5:1 | pass |
| Contact eyebrow    | 11px / 500    | 5.85:1  | 4.5:1 | pass |
| Contact `h2`       | 36px          | 8.96:1  | 3:1   | pass |
| Contact lede       | 16px          | 5.95:1  | 4.5:1 | pass |
| Contact email      | 24px          | 4.72:1  | 3:1   | pass |
| Contact tiles      | 12px          | 4.68:1  | 4.5:1 | pass |
| Contact tiles, 390 | 12px          | 5.57:1  | 4.5:1 | pass |

Hero figures are worst-case across 1920×1080, 1440×900, 1366×768 and 1280×720 ×
five frames. Contact figures are worst-case across five frames spanning the
13s/16s/11s blob drift at 1440×900, plus the mobile tile check above. The
Contact eyebrow and lede figures are the tightest thing on the page and are
watched rather than trusted.

Field description, hero at 1440×900: median chroma 138, p50 luminance 0.0394,
p99 0.0898, mean RGB `[50,24,136]`.

Remaining checks:

- 320 → 1920, no horizontal overflow at any width. **Verified** at 1920, 1440,
  1280 and 390 — no overflow at any.
- The `Grainient` field does not band or posterize at 1920.
- `prefers-reduced-motion`: no drifting blobs, no reveals, one static
  `Grainient` frame, one static aurora frame, and no rAF running.
- No JavaScript: all content visible.
- WebGL unavailable: the hero falls back to `bg-bg`; the contact blobs and dot
  grid still render, being CSS and 2D canvas.
- `/projects/[slug]` renders `Contact` too, so it inherits the new background.
  **Verified** on all three slugs: contact present, both canvases, three blobs,
  aurora band, no overflow, clean console.
- Clean console. **Verified** on all five routes. The only console error
  anywhere is the expected 404 on an unknown path.
- `document.hidden` pausing. **Verified** by instrumenting `requestAnimationFrame`
  and toggling the property: demand falls from 113 to 74 calls per 600ms with
  Contact on screen. That is the `DotGrid` cancelling outright — the only one
  doing a full-viewport 2D repaint per frame — while `SoftAurora` keeps a parked
  frame and skips its render, which is what its own comment claims.

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
