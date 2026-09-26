# Ralph Portfolio: Design Spec

Date: 2026-09-26
Status: Approved in conversation, pending written review
Revised: 2026-09-26 — visual layer superseded by the dark geometric redesign below
Revised: 2026-09-26 — `muted-bright` token added and the section ambience
  relocated, by the Grainient pass. See
  `2026-09-26-ralph-portfolio-grainient-design.md`.

## Redesign addendum (2026-09-26)

The original paper/editorial visual direction is **superseded**. The content
contract, route architecture, contact flow, and accessibility rules further down
still stand; the type, colour, and motion decisions below are replaced by this
section wherever the two disagree.

| Concern | Original | Now |
|---|---|---|
| Visual language | Light paper, editorial, serif/sans | Dark geometric, terminal-inspired |
| Display face | Anybody | **Michroma** (400 only — never `font-bold`) |
| Text face | Satoshi (local) + Azeret Mono | **JetBrains Mono** for body and mono |
| Motion | Anime.js v4 hero timeline | **GSAP 3.15 (`InertiaPlugin`)** hero lattice + **Anime.js 4.5** card hover |
| Hero background | None | `DotGrid` lattice over a CSS gradient wash and three drifting glow blobs, with a `SoftAurora` band at the bottom edge |
| Hero layout | None | Single centred column: eyebrow, name, hook, two CTAs |
| Projects layout | Flat 2-column grid | **Mosaic**: first project spans the full row and lays out sideways from `md`; the rest share the row beneath |
| Skills layout | Chip grid in 3 columns | **Two equal columns**: skill list left, React Bits `InfiniteSpiral` right |
| Spiral marks | None | **Full-bleed brand-coloured logos**; monogram branch kept for future skills |
| Section nav | Static links | `GooeyNav`, outlined below `sm` |
| Shape language | Rounded, paper cards | Square corners; rounded hero pills kept on purpose |

**Tokens.** `bg #08080a`, `surface #101014`, `surface-2 #17171c`, `line #26262e`,
`fg #f4f4f1`, `muted #8b8b95`, `muted-bright #c2c4cd`, `accent #4d6fd1`,
`accent-bright #9db4e3`, `accent-deep #1c2547`, `ember #e08a3c`,
`ember-bright #f0a95e`. The `line-soft` token is currently unused and a
candidate for removal.

`status-wip #e08a3c` was **renamed** to `ember`, not duplicated — the hex was
already identical, and the rename gives the colour a role rather than a single
consumer. `ember` fills buttons, tiles and chips; `ember-bright` is the text and
border step for use on live fields, plus the hover fill. See
`2026-09-26-ralph-portfolio-about-section-design.md` § Ember actions.

`muted-bright` was added later, in the Grainient pass. It exists for one job:
**text that sits on a moving field** — the hero hook, and the contact eyebrow
and lede. `muted` is 4.5:1 against the flat page background but only ~3.3:1 once
the shader, dot lattice or gradient blobs are behind it, which fails AA. It is
not a general-purpose lighter grey; do not apply it to body copy. See
`2026-09-26-ralph-portfolio-grainient-design.md`.

**Rounded pills are intentional.** The hero CTAs are the only rounded elements in
the site, kept as the one piece of soft contrast against the geometry. Do not
normalise them away in a later pass.

**The hero is a single centred column.** No portrait, no second column. The name
and hook are centred on the vertical axis, and the lattice runs full-bleed behind
them. The `DotGrid` canvas fills the hero from its own box via `ResizeObserver`, so
the field is never cropped on one axis or the other.

**The hero grid is decorative and optional.** `DotGrid` must never be
load-bearing. The hero copy is real DOM, the canvas is
`aria-hidden` and `pointer-events: none`, and reduced motion draws one static
frame. The canvas sizes itself from the hero box via `ResizeObserver`, so the
lattice always fills the hero exactly — a fixed or intrinsic canvas size crops
the field on one axis or the other.

**The hero's bottom border is gone, replaced by an aurora band.** `border-b
border-line` was a hard hairline that cut the hero off from the page. A
`SoftAurora` band now occupies the bottom ~150px of the hero, masked at its top
edge so the canvas rectangle has no visible seam and the glow appears to rise out
of the page. Behind the lattice sit a static blue gradient wash and three soft
blobs drifting on 8s, 11s and 14s cycles — those three durations share no common
factor worth noticing, so the composition does not visibly loop. The blobs are
`radial-gradient` stops rather than blurred elements: a large animated
`filter: blur()` makes the compositor re-rasterise a full-screen layer every
frame. Every decorative layer sits inside one `absolute inset-0` wrapper, so the
copy is unambiguously above all of them and cannot be overlapped by a canvas that
happens to be taller than expected. The band is `pointer-events-none`, takes no
mouse input, pauses its render loop when scrolled out of view, and fails quietly
where WebGL is unavailable, leaving the gradient and the glows to carry the hero
on their own.

## Goal

Ship a single-page developer portfolio with per-project detail pages. The site has to
serve two audiences at once. Recruiters and engineering managers scan it for thirty
seconds and need to place the candidate in a stack. Technical screeners read the
projects section and need evidence of architecture decisions.

The site carries its own proof of backend competence through a validated contact
form (Zod + Server Action + Resend) rather than through claims about backend skill.

## Locked decisions

| Decision | Choice | Why |
|---|---|---|
| Site shape | Single page plus `/projects/[slug]` detail pages | Home stays scannable; detail pages hold the depth |
| Content storage | Typed TypeScript data module | Type-checked and refactor-safe; 3 projects do not justify an MDX pipeline |
| Detail template | One shared template, optional slots | Three projects at different maturity levels share one look |
| Skills grouping | 5 category groups, overlap corrected | Clearer for a screener than role-based grouping |
| Hero title | "Software Engineer" | "Full-Stack Web Developer" reads a level below engineer and narrows a stack that includes Java, C#, Python, and Flutter |
| Project statuses | `live`, `private`, `wip` | The three projects sit in three different states and the UI names each one |
| December project label | "In development", no date | A hard date on a public site goes stale |
| Contact form | Built fully, inert until an address exists | No rework once the address arrives |
| Screenshot sourcing | User supplies | Cannot be generated here |

## Stack

| Concern | Choice | Notes |
|---|---|---|
| Framework | Next.js App Router + TypeScript | Verify the current stable major at install |
| Styling | Tailwind CSS v4 | CSS-first config. No `tailwind.config.js`; tokens live in `@theme` |
| Motion | GSAP 3.15 (`gsap` + `gsap/InertiaPlugin`) | Replaces Anime.js. See the redesign addendum and the motion notes below |
| Validation | Zod v4 (`^4`) | Used for both the contact form and a build-time content check |
| Email | Resend | Requires a verified sending domain in production |
| Hosting | Vercel | GitHub push to deploy |

### Version API constraints

These three libraries changed their APIs in recent majors. Most generated code and
most tutorials target the older API and will fail. Pin the majors and write against
the current surface.

**GSAP 3.15** (current hero motion)
- Import from the package root: `import gsap from "gsap"` and `import { InertiaPlugin } from "gsap/InertiaPlugin"`. Types ship in `gsap/types`.
- All former Club plugins, `InertiaPlugin` included, are in the public npm package from 3.13 onward. No Club membership, token, or private registry.
- Register the plugin **inside the effect**, not at module scope, so nothing GSAP-related has to be SSR-safe during module evaluation.
- `inertia` is an object, not a boolean: `inertia: { resistance: 750 }`. `inertia: true` does not typecheck (`TS2322: boolean is not assignable to InertiaVars`) and does not configure the plugin.

**vgpu 0.5.0 — installed, but the hero no longer uses it**
The hero moved to `DotGrid`. `shape-waves.tsx` and its CSS were then deleted as
dead source, but the `vgpu` dependency is deliberately retained, so the
implementation is recoverable without a reinstall if it is ever wanted back.
`vgpu` is now an unused dependency: it ships no bundle, because nothing imports
it. The notes below are the reason the old renderer was dropped, and the reason
it would need fixing before it could return.

- Its canvas sizes itself from a WGSL-computed height, so it rendered ~712px tall
  inside a ~554px hero and cropped. That is the defect that ended its use here.

- Import from the package root: `import { init, effect, frame, frameLoop, surface, texture, sampler, clock } from "vgpu"`. The `vgpu/client` subpath only exports the Vite WGSL plugin and types, not the runtime API.
- `vgpu` is pre-1.0. Pin the exact version; do not use a caret range.
- Node-only imports are confined to `vgpu/node`; the root entry stays browser-safe, which is what makes it work in a Next client component.
- `DrawOptions.shader` accepts a raw WGSL string. The documented `.wgsl` + Vite plugin path does not apply under Next, so the shader is inlined.
- Surface targets exist only inside `frame(gpu, ...)`. Calling `wave.draw(surface)` directly throws `Surface targets are only available inside frame(gpu)`.
- `init()` rejects when no adapter is available. Always catch it; an un-awaited call becomes an unhandled rejection and shows up as a console error.

**Anime.js v4** — removed, kept for history only
- Named imports only: `import { animate, stagger, createTimeline, utils } from 'animejs'`
- No default export. `anime({...})` and `anime.timeline()` do not exist in v4
- `ease`, not `easing`
- Timelines require `.init()` before playback

**Zod v4**
- `z.email()` replaces `z.string().email()`
- `{ error: "..." }` replaces `{ message: "..." }` for custom messages
- `errorMap` is replaced by an `error` function
- `result.error.issues` for field-level mapping
- `.flatten()` and `.format()` are deprecated. Use `z.treeifyError()`

**React 19**
- `useActionState` replaces `useFormState`

**Tailwind v4**
- `@import "tailwindcss"` in the global stylesheet
- Design tokens declared in a `@theme` block
- No JavaScript config file by default

## Content contract

All page content lives in two typed modules. Components read from these modules and
contain no hardcoded copy.

### `src/lib/content/projects.ts`

```ts
export type ProjectStatus = 'live' | 'private' | 'wip'

export interface ProjectLink {
  label: string
  href: string
}

export interface Project {
  slug: string
  title: string
  status: ProjectStatus
  hook: string
  summary: string
  stack: string[]
  screenshot: { src: string; alt: string }
  links: ProjectLink[]
  featured: boolean
  order: number

  // Optional detail-page slots. The template hides any slot left empty.
  problem?: string
  role?: string
  architecture?: string
  decisions?: { heading: string; body: string }[]
  lessons?: string
}
```

`status` drives both the badge and which links render. This is how the site avoids
shipping a dead "Live Demo" button.

| status | Badge | Links |
|---|---|---|
| `live` | Live | Live Demo and GitHub |
| `private` | Private repo | GitHub when public, otherwise none |
| `wip` | In development | none |

An empty `links` array is valid and the card omits the link row entirely.

The optional slots let one template serve all three projects. The private-repo
project fills every slot. The live project fills `problem` and `decisions`. The
in-development project fills almost nothing, because a promise is not a project yet.

### `src/lib/content/site.ts`

```ts
export interface SkillGroup {
  id: string
  label: string
  items: string[]
}

export interface SocialLink {
  label: string
  href: string
}

export interface SiteConfig {
  name: string
  title: string
  hook: string
  avatar: { src: string; alt: string }
  resume: { href: string; filename: string }
  socials: SocialLink[]
  skills: SkillGroup[]
}
```

Confirmed values: `name` is "Ralph Ethan De Guzman", `title` is "Software Engineer".
`hook` is not written yet. It should carry the full-stack web and cloud focus that
the shortened title dropped. The interim value is
"Software engineer building full-stack web and cloud systems."

### Skills groups

Five groups, per the user's taxonomy. Two corrections applied to the supplied list:

- Express.js moves from "Backend & Databases" to "Frameworks & Libraries", where a
  framework belongs
- "JavaScript (ES6+)" becomes "JavaScript". The version suffix duplicates a language
  already listed
- Firebase sits in "Cloud & Platforms" only, not repeated as a database

| Group | Items |
|---|---|
| Languages | Python, Java, C#, TypeScript, JavaScript, PHP, HTML5, CSS3, SQL |
| Frameworks & Libraries | Next.js, React, Laravel, Flutter, Tailwind CSS, Express.js |
| Backend & Databases | Node.js, MySQL, PostgreSQL, SQLite |
| Cloud & Platforms | Azure Services, Firebase |
| Tools & Environments | Docker, Git, GitHub, Postman, Android Studio |

## Route and component architecture

Two client components carry all client-side JavaScript. Every other component is a
Server Component and ships no JavaScript.

```
src/
  app/
    layout.tsx                 RSC  metadata, fonts, skip-link
    page.tsx                   RSC  composes the four sections
    globals.css                     Tailwind v4 @theme tokens
    opengraph-image.tsx             OG image for link previews
    actions/
      contact.ts               'use server'
    projects/
      [slug]/
        page.tsx             RSC  generateStaticParams, generateMetadata
  components/
    dot-grid.tsx               client  React Bits DotGrid, hero-only, GSAP inertia
    gooey-nav.tsx              client  SVG filter + section observer
    hero.tsx                   RSC    centred copy shell
    infinite-spiral.tsx        client  React Bits InfiniteSpiral, adapted (see Motion)
    skill-spiral.tsx           client  binds authored skills to spiral cards
    projects.tsx               RSC    maps featured projects to cards
    project-card.tsx           client  status badge, links, Anime.js hover
    project-detail.tsx         RSC    shared template, optional slots
    skills.tsx                 RSC    two equal columns: list + spiral
    contact-section.tsx        RSC
    contact-form.tsx           client  useActionState
    icon.tsx                   RSC    inline SVG set
  lib/
    content/
      projects.ts
      site.ts
      schema.ts                    Zod schema mirroring the types above
    resend.ts                      lazy client
    rate-limit.ts                  in-memory token bucket
    env.ts                         typed env access
public/
  resume.pdf
  avatar.jpg
  projects/<slug>.png
```

`icon.tsx` holds a small inline SVG set so the site carries no icon-library
dependency. `next/link` covers outbound links, and the resume link uses the `download`
attribute, since files in `public/` are served inline otherwise.

## Contact form data flow

Order of operations inside the Server Action:

1. Read `FormData` from the action payload
2. Honeypot check. A populated hidden `company` field returns `status: 'success'`
   without sending. The bot sees a normal response and learns nothing
3. Rate limit check against a per-IP token bucket
4. Environment check. `CONTACT_EMAIL` unset returns the configured-error state
5. Zod v4 `safeParse` on name, email, and message
6. On parse failure, map `result.error.issues` to per-field messages
7. On success, call Resend
8. On Resend failure, log server-side and return a generic failure state

The action returns a discriminated union and never throws to the client:

```ts
export type ContactState =
  | { status: 'idle' }
  | { status: 'success' }
  | {
      status: 'error'
      message: string
      fieldErrors?: Partial<Record<'name' | 'email' | 'message', string>>
    }
```

The destination address is read from `process.env.CONTACT_EMAIL` and never enters the
client bundle. Placeholder values live in `.env.example`; `lib/env.ts` throws at
startup when a required variable is missing, so a misconfigured deploy fails with a
clear error rather than dropping mail without a trace.

### Schema

```ts
const contactSchema = z.object({
  name: z.string().min(1, { error: 'Enter your name' }).max(100),
  email: z.email({ error: 'Enter a valid email address' }),
  message: z.string().min(10, { error: 'Write at least 10 characters' }).max(2000),
})
```

The honeypot field stays out of this schema. It is checked before parsing so that a
bot response never reaches the validation layer.

### Rate limiting

An in-memory token bucket, roughly 5 submissions per IP per hour. This stops naive
scripted spam. It does not survive a cold start and it does not stop a determined
attacker, because Vercel serverless instances are ephemeral and multiply across
regions. Durable limiting needs a shared store such as Upstash Redis or Vercel KV.
That work is out of scope for v1, and the site should not claim otherwise.

The client IP comes from the `x-forwarded-for` header via `headers()`. Server Actions
run per request, so reading a header there does not make any route dynamic and the
pages stay statically generated.

Honeypot hits return before the rate limiter runs, so bot traffic does not consume a
visitor's tokens. A rate-limited visitor gets the same error shape as any other
rejection, with no detail about which check fired.

## Motion

**Superseded — see the redesign addendum.** Anime.js was removed from
`package.json` and `hero-motion.tsx` deleted. Animation is now split three ways:

- `DotGrid` — the hero lattice, a React Bits component adapted for this codebase.
  `dotSize 3`, `gap 24`, `base #2A3350`, `active #9DB4E3`, `proximity 120`, so it
  reads as a fine background texture rather than a second foreground. Colours
  must be 6-digit hex literals: the parser cannot read a CSS custom property and
  silently yields black. Four deliberate departures from upstream — the root is
  `pointer-events: none` with effects driven by a `window` listener gated to the
  canvas rect; reduced motion draws one static frame and never binds a listener;
  the `requestAnimationFrame` loop is gated on the hero being on screen; and the
  prop surface is a subset, since upstream's `speedTrigger` and `maxSpeed` drive a
  cursor-speed response this grid does not want — the follow is a GSAP tween, so
  there is no velocity to accelerate. `resistance` is not a prop here; it is a
  fixed value on the shockwave tween's `inertia`. Clicking a control over
  the grid must not fire the shockwave.
- `InfiniteSpiral` — the skills helix, a React Bits component adapted for this
  codebase. Auto-drifts, is draggable, and responds to page scroll. Seven
  deliberate departures from upstream, all load-bearing: the redraw loop stops
  when the spiral scrolls off screen (upstream reschedules
  `requestAnimationFrame` unconditionally forever and only zeroes the auto-speed,
  so an invisible spiral still burns a frame per tick); `items` must be
  referentially stable or the effect re-runs every render; cards are dark panels
  with a hairline border rather than upstream's translucent white, which would
  invert the contrast on a near-black page; images use `contain` with padding,
  because `cover` crops a square brand mark to its corners; raw `<img>` carries a
  scoped `no-img-element` exemption, because `next/image` injects its own
  wrapper and intrinsic sizing that fights the per-frame transform; the component
  checks `prefers-reduced-motion` itself, since the global CSS rule only
  clamps CSS durations and this is driven by inline styles from JavaScript; and
  every card ships at `opacity-0`, because the cards are absolutely centred in
  the server-rendered markup and the transforms that spread them along the helix
  are written by the first animation frame — without that default, a
  no-JavaScript visit stacks all 25 cards on one pixel as a single opaque pile.
  The first `render` pass assigns an inline opacity to every card, which outranks
  the class, so the pile is never painted.
- **Spiral marks are brand-coloured, on a light plate.** The mark is a brand
  asset, so it carries the brand's own hex. Measured against the `surface-2`
  card, several of those hexes are not legible: Next.js `#000000` sits at 1.2:1,
  GitHub `#181717` and Express `#0A0A0A` at about 1:1, SQLite `#003B57` at
  1.5:1, while React and JavaScript reach 11:1 and 13:1. The mark now carries its
  brand fill directly and fills the whole card, with no plate behind it. The three
  monochrome brands (Next.js, GitHub, Express) ship the white those brands
  actually use for dark mode, and C#, CSS3, Flutter and SQLite were lightened
  until they cleared the same bar. `logo-colors.test.ts` holds all 23 marks above
  3:1 on the `#17171c` card fill, asserts the exact asset count, and rejects any
  mark that still relies on `currentColor`, so a regression fails the build
  rather than shipping.
- **Monogram fallback.** A skill with no mark renders its name as real text, so
  it inherits the page's colour tokens and survives a palette change. The skill
  set was trimmed to the 23 that each have a brand mark, so nothing needs a
  monogram today; the branch stays in `getSkillMark` as the landing spot for the
  next skill that has no mark yet. A monogram is text and needs no plate to be
  legible.
- `SkillSpiral` frame — no border and no fixed height. The frame matches whatever
  height the grid row resolves to, which the skill list beside it sets. The
  `min-h` is a floor, not a height: the cards are absolutely positioned and add
  no height, so once the fixed heights came off a mobile frame (alone in its row)
  resolved to zero and `overflow-hidden` clipped the whole spiral away. A
  min-height can only raise the frame, so it never caps the desktop stretch.
- `ProjectCard` mosaic — the first project spans the full row and lays out
  sideways from `md`, image left and text right, with the rest sharing the row
  beneath. One dominant tile, no masonry maths, and no dependence on how many
  projects exist. Laying the tile out sideways is what makes it work: a wide
  screenshot inside a full-width 16:10 box would be far taller than its box,
  where at half width the image lands at 1.63:1 against the screenshot's native
  1.6:1 and is barely cropped. `priority` is inert in this Next version, so the
  eager-loading hint is set by hand via `loading`/`fetchPriority`; `sizes` differs
  per variant, since the feature image is half the row and a standard image is
  half a column.
- `ProjectCard` hover — Anime.js 4.5. Image scales and brightens, the card lifts
  `-4px`, and the ordinal, title, hook, and stack list rise and un-dim on a
  stagger. **Anime.js owns transform, opacity and filter; CSS keeps owning colour
  and border.** Mixing the two on one property makes them fight. Hover animation
  is skipped entirely under `prefers-reduced-motion` and under `(hover: none)`,
  where the card's CSS border colour is the only feedback. The global reduced-motion
  rule cannot do this job, because Anime.js writes inline styles from JavaScript.
- `GooeyNav` — CSS/SVG filter on the section list, with the goo dropped below
  `sm` because the white pill and its dark label both assume the filter exists.

The lesson from the original Anime.js timeline carries over and is worth keeping:
**the hidden initial state must be set from JavaScript, never from CSS.** A
`@media (prefers-reduced-motion: no-preference)` rule that starts content at
`opacity: 0` makes the page permanently invisible with JavaScript disabled,
because such a browser still reports `no-preference`. The hero is server-rendered
and readable by default; motion only ever enhances it.

## Accessibility

- Skip link as the first focusable element
- `prefers-reduced-motion` honored by skipping the animation entirely
- Status badges carry text, so color is never the only signal
- Form errors reference their input through `aria-describedby`; the error summary
  carries `role="alert"`
- Every screenshot declares `alt` in the content type, so the text cannot be omitted
  during authoring
- Visible focus rings on all interactive elements
- Semantic landmarks: one `main`, `nav` where present, `footer`

## Verification

**Content tests**
- Every entry in `projects.ts` parses against `content/schema.ts`
- `status: 'live'` implies at least one entry in `links`
- `slug` values are unique and match `^[a-z0-9-]+$`
- `order` values are unique

**Contact action tests**
- Malformed email returns a `fieldErrors.email` entry and sends nothing
- Message under 10 characters returns a `fieldErrors.message` entry
- Populated honeypot returns `success` and sends nothing
- Missing `CONTACT_EMAIL` returns the configured-error state
- Rate limit exceeded returns the rate-limit error

**Gates**
- `npm run typecheck`
- `npm run lint`
- `npm run test`
- `npm run build`

The build acts as its own test. A malformed slug breaks `generateStaticParams`, and a
content schema violation fails the build.

## Delivery phases

| # | Phase | Exit condition |
|---|---|---|
| 0 | Scaffold Next.js, TypeScript, Tailwind v4. Pin `zod@^4` (motion lib: `gsap@^3.15`) | App builds and serves |
| 1 | `content/schema.ts`, `site.ts`, three project stubs, validation test | Content tests pass |
| 2 | Layout, `@theme` tokens, `next/font`, skip link | Shell renders |
| 3 | Hero and `hero-motion.tsx` | Hero animates, reduced motion respected |
| 4 | Projects grid and `/projects/[slug]` | Three pages build statically |
| 5 | Skills section | Five groups render |
| 6 | Contact form, Zod, Server Action, Resend, honeypot, rate limit | Contact tests pass |
| 7 | Resume, avatar, screenshots, OG image, metadata, accessibility pass | Assets wired |
| 8 | typecheck, lint, test, build. Vercel deploy and domain | Site live |

## Out of scope

- Upstash Redis or Vercel KV for durable rate limiting
- Analytics of any kind
- Dark mode toggle
- A CMS or admin UI for editing content
- MDX or Markdown content authoring
- Blog, writing, or case-study index
- A notify-me signup for the in-development project
- Localization

## Inputs required from the user

These are user-authored content, not placeholders. Each has a defined default so the
build proceeds without them.

| Input | Default while absent |
|---|---|
| Three project titles, hooks, summaries, stacks, statuses | Stub entries with a real slug and `status: 'wip'`, excluded from `featured` |
| Private-repo project detail (problem, role, architecture, 2-3 decisions, lessons) | Slot hidden |
| Hero hook sentence | Derived from the title |
| `resume.pdf` | Button renders disabled with a `title` explaining the file is pending |
| `avatar.jpg` | Initials render in a styled circle |
| Project screenshots | Neutral placeholder block using `@theme` tokens |
| Contact email address | Form renders the configured-error notice, sends nothing |
| Resend API key and verified sending domain | Same as above |
| GitHub and LinkedIn URLs | Social links omitted |

## Known risks

**Skills list outruns the evidence.** Until the project descriptions land, the skills
section is the only concrete proof on the site. Thirty skills without project evidence
reads as a claim. Three projects with matching evidence reads as a track record. This
is a writing task, not a code task, and it should start alongside phase 4.

**Resend domain verification blocks mail.** The form cannot deliver until a sending
domain is verified through DNS records. The account's onboarding address is restricted
to development and to the account holder's own inbox, so production mail needs a real
domain configured first.

**Public date commitments go stale.** The in-development project carries no date for
this reason. Adding one later means accepting the risk of a missed date.
