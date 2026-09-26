# Ralph Portfolio: Design Spec

Date: 2026-09-26
Status: Approved in conversation, pending written review
Revised: 2026-09-26 — visual layer superseded by the dark geometric redesign below

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
| Motion | Anime.js v4 hero timeline | **GSAP 3.15 / `InertiaPlugin`** dot lattice + CSS |
| Hero background | None | React Bits `DotGrid` canvas, hero-only |
| Hero portrait | None | Formal photo, hero right, full colour, square corners |
| Global accent | None | Cursor-reactive `CursorGrid` behind all content, **excluded from the hero** |
| Section nav | Static links | `GooeyNav`, outlined below `sm` |
| Shape language | Rounded, paper cards | Square corners; rounded hero pills kept on purpose |

**Tokens.** `bg #08080a`, `surface #101014`, `surface-2 #17171c`, `line #26262e`,
`fg #f4f4f1`, `muted #8b8b95`, `accent #4d6fd1`, `accent-bright #9db4e3`,
`accent-deep #1c2547`, `status-wip #e08a3c`. Content sits at `z-10`; the cursor
layer is `z-0` and `pointer-events: none`.

**Rounded pills are intentional.** The hero CTAs are the only rounded elements in
the site, kept as the one piece of soft contrast against the geometry. Do not
normalise them away in a later pass.

**The two dot fields never overlap.** `DotGrid` is scoped to `#top` and
`CursorGrid` is fixed page-wide, so the hero paints its own opaque background
(`bg #08080a` at `z-10`) over the `z-0` cursor layer. This is structural, not
incidental: do not make the hero background transparent, or the 44px cursor
lattice will show through the 24px hero lattice. Measured: hero spacing 24.01px,
cursor spacing 44px, distinct composite values.

**The hero grid is decorative and optional.** `DotGrid` must never be
load-bearing. The hero copy and portrait are real DOM, the canvas is
`aria-hidden` and `pointer-events: none`, and reduced motion draws one static
frame. The canvas sizes itself from the hero box via `ResizeObserver`, so the
lattice always fills the hero exactly — a fixed or intrinsic canvas size crops
the field on one axis or the other.

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
    cursor-grid.tsx            client  fixed pointer-reactive canvas, page-wide
    dot-grid.tsx               client  React Bits DotGrid, hero-only, GSAP inertia
    gooey-nav.tsx              client  SVG filter + section observer
    hero.tsx                   RSC    shell, two-column copy + portrait
    projects.tsx               RSC    maps featured projects to cards
    project-card.tsx           RSC    status badge, conditional links
    project-detail.tsx         RSC    shared template, optional slots
    skills.tsx                 RSC
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
- `CursorGrid` — a fixed, `pointer-events: none` canvas that redraws on
  window-level `pointermove` only. No `requestAnimationFrame` loop, so an idle
  page costs nothing. Deliberately excluded from the hero by the hero's own
  opaque background.
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
