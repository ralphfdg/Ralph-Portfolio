# Ralph Portfolio Build Plan

> **Superseded in part — read this first.** This document is the original execution
> plan and is kept as the record of how the page was first built. Its motion
> sections no longer describe the shipped page. What actually ships:
>
> - **Two animation libraries, split by job.** The hero lattice is **GSAP**
>   (`gsap@^3.15` + `InertiaPlugin`) in `src/components/dot-grid.tsx`. The
>   project-card hover is **Anime.js** (`animejs@^4.5`) in
>   `src/components/project-card.tsx`. The original plan used Anime.js for a hero
>   timeline; that timeline and `hero-motion.tsx` are gone.
> - **The hero is a single centred column**, no portrait. `src/components/hero.tsx`
>   renders the eyebrow, name, hook, and two CTAs centred, with the DotGrid
>   full-bleed behind them.
> - **`CursorGrid` has been deleted**, along with its fixed canvas and its CSS and
>   the `z-10` on `<main>` that only existed to sit above it.
> - **Skills is two equal columns**: the authored skill list on the left, a React
>   Bits `InfiniteSpiral` on the right (`infinite-spiral.tsx` + `skill-spiral.tsx`).
>   Skill marks live in `src/lib/content/skill-marks.ts` and the SVGs in
>   `public/logos/`. See the Motion section of the spec for the six deliberate
>   departures from upstream and for why the logo fills are baked rather than
>   `currentColor`.
> - **`src/components/shape-waves.tsx` and its CSS have been deleted** as dead
>   source. The `vgpu` dependency is deliberately **retained** and is now unused —
>   it ships no bundle, since nothing imports it.
> - The design system of record is the redesign addendum in the spec, not the token
>   list in Task 1 below.
>
> Tasks 1–12 remain accurate for content, routing, and the projects grid. Task 5
> ("Hero and motion") is superseded by the above.

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development
> (recommended) or superpowers:executing-plans to implement this plan task-by-task.
> Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a single-page developer portfolio with per-project detail pages, so a
recruiter can place the candidate in a stack in thirty seconds and a technical screener
can read architecture decisions.

**Architecture:** All content lives in two typed modules validated by a Zod schema, with
TypeScript types inferred from that schema so the invariants and the types cannot drift.
Two client components carry all JavaScript (hero motion, contact form). Every other
component is a Server Component and ships no JavaScript.

**Tech Stack:** Next.js App Router, TypeScript, Tailwind CSS v4, Anime.js v4, Zod v4,
Resend, Vercel, Vitest.

**Spec:** `docs/superpowers/specs/2026-09-26-ralph-portfolio-design.md`

## Global Constraints

- Pin `animejs@^4.3.0` and `zod@^4`. Both had breaking API changes. Write against the
  current surface only.
- Anime.js v4: named imports only, no default export, `ease` not `easing`.
- Zod v4: `z.email()` and `z.url()` are top-level. `{ error: "..." }` replaces
  `{ message: "..." }`. Never call `.flatten()` or `.format()`.
- React 19: `useActionState` replaces `useFormState`.
- Tailwind v4 is CSS-first. No `tailwind.config.js`. All tokens in a `@theme` block.
- Satoshi is not on Google Fonts. It loads through `next/font/local` from a
  self-hosted woff2 in `src/app/fonts/`.
- Anybody is a variable font with a `wdth` axis. `next/font/google` must declare
  `axes: ['wdth']`, otherwise width values will not bind.
- Reduced motion and no-JS visitors must both see the hero content. Never hide
  content in CSS and rely on JavaScript to reveal it. Set animation from-states from
  the script, in a layout effect, and skip the animation entirely under
  `prefers-reduced-motion`.
- Two accents, strictly assigned. Blue means actionable, amber means incomplete.

## Design Tokens

> **Superseded 2026-09-26** by the dark geometric redesign. The paper tokens below
> are retained for history only; the values now in `globals.css` are the dark set.
> See the spec's redesign addendum for the full rationale.

<details>
<summary>Original paper tokens (no longer in use)</summary>

```css
--color-paper:         #F6F6F3;
--color-ink:           #0B0B0C;
--color-line:          #E2E1DC;
--color-muted:         #6B6A66;
--color-accent:        #425B9A;  /* 6.1:1 on paper, actionable */
--color-accent-strong: #33477D;  /* 8.3:1, hover, passes AAA */
--color-accent-tint:   #EDF0F7;  /* section fills */
--color-status-wip:    #B4530C;  /* amber, status badge only */
```

Type: Anybody display (width axis held below maximum) · Satoshi body · Azeret Mono for
stack chips, section eyebrows, and metadata.

</details>

Current dark set:

```css
--color-bg:            #08080A;
--color-surface:       #101014;
--color-surface-2:     #17171C;
--color-line:          #26262E;
--color-line-soft:     #1A1A20;
--color-fg:            #F4F4F1;
--color-muted:         #8B8B95;
--color-accent:        #4D6FD1;
--color-accent-strong: #6B8ADE;
--color-accent-bright: #9DB4E3;  /* accent text on dark */
--color-accent-deep:   #1C2547;  /* image wells */
--color-status-wip:    #E08A3C;
```

Type: Michroma display (**400 only — no `font-bold`**) · JetBrains Mono body and mono.

---

# Plan 1: The Viewable Site

### Task 1: Scaffold, dependencies, and test runner

**Files:**
- Create: whole project via `create-next-app`
- Modify: `package.json` (scripts)

**Interfaces:**
- Produces: `npm run dev`, `npm run build`, `npm run test`, `npm run typecheck`,
  `npm run lint`

- [ ] **Step 1: Scaffold**

```bash
npx create-next-app@latest . --typescript --tailwind --app --src-dir --eslint --import-alias "@/*" --use-npm
```

The repo already holds `LICENSE`, `README.md`, `.gitignore`, and `.gitattributes`.
Next treats those as safe conflicts and proceeds. If it refuses, scaffold into a
temp directory and move the result in.

- [ ] **Step 2: Install runtime dependencies**

```bash
npm i animejs@^4.3.0 zod@^4 resend
```

- [ ] **Step 3: Install test tooling**

```bash
npm i -D vitest
npm pkg set scripts.test="vitest run"
npm pkg set scripts.typecheck="tsc --noEmit"
```

- [ ] **Step 4: Configure Vitest**

Create `vitest.config.ts` at the repo root with the `@/*` alias resolved, so tests
import content modules the same way components do.

- [ ] **Step 5: Verify the scaffold**

Run: `npm run build`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "chore: scaffold Next.js app with vitest"
```

---

### Task 2: Fonts and design tokens

**Files:**
- Create: `src/app/fonts/satoshi-regular.woff2`, `satoshi-medium.woff2`, `satoshi-bold.woff2`
- Modify: `src/app/globals.css`, `src/app/layout.tsx`

**Interfaces:**
- Produces: CSS variables `--font-anybody`, `--font-satoshi`, `--font-azeret`
- Produces: Tailwind utilities `font-display`, `font-body`, `font-mono`, and
  `text-paper`, `text-ink`, `text-line`, `text-muted`, `text-accent`,
  `text-accent-strong`, `bg-accent-tint`, `text-status-wip`

- [ ] **Step 1: Download Satoshi woff2 files**

Fetch Satoshi Regular, Medium, and Bold from Fontshare. They are free but not served
from Google Fonts. Place them in `src/app/fonts/`.

- [ ] **Step 2: Declare the token block**

Replace the default Tailwind v4 import block in `src/app/globals.css` with the
`@theme` block from the Design Tokens section above, keeping `@import "tailwindcss";`
at the top.

- [ ] **Step 3: Wire the fonts in `layout.tsx`**

```ts
import { Anybody, Azeret_Mono } from 'next/font/google'
import localFont from 'next/font/local'

const anybody = Anybody({
  subsets: ['latin'],
  axes: ['wdth'],
  variable: '--font-anybody',
  display: 'swap',
})

const azeret = Azeret_Mono({
  subsets: ['latin'],
  variable: '--font-azeret',
  display: 'swap',
})

const satoshi = localFont({
  src: [
    { path: './fonts/satoshi-regular.woff2', weight: '400', style: 'normal' },
    { path: './fonts/satoshi-medium.woff2', weight: '500', style: 'normal' },
    { path: './fonts/satoshi-bold.woff2', weight: '700', style: 'normal' },
  ],
  variable: '--font-satoshi',
  display: 'swap',
})
```

Attach all three `variable` classNames to `<html>`.

- [ ] **Step 4: Verify the width axis binds**

Create a temporary element using `font-display` with an explicit width value, such
as `[font-variation-settings:'wdth'_75]`. Confirm in the browser that the glyphs
narrow. If not, the `axes: ['wdth']` declaration is missing.

- [ ] **Step 5: Verify**

Run: `npm run typecheck && npm run build`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: add type system and design tokens"
```

---

### Task 3: Content layer

**Files:**
- Create: `src/lib/content/schema.ts`
- Create: `src/lib/content/site.ts`
- Create: `src/lib/content/projects.ts`
- Test: `src/lib/content/schema.test.ts`

**Interfaces:**
- Produces: `type Project = z.infer<typeof projectSchema>`
- Produces: `type ProjectStatus = 'live' | 'private' | 'wip'`
- Produces: `type SkillGroup`, `type SiteConfig`
- Produces: `projects: Project[]`, `site: SiteConfig`

- [ ] **Step 1: Write the failing test**

`schema.test.ts` covers five cases:

```ts
import { describe, it, expect } from 'vitest'
import { projectsSchema, projectSchema, siteSchema } from './schema'
import { projects } from './projects'
import { site } from './site'

describe('content schema', () => {
  it('accepts every authored project', () => {
    expect(projectsSchema.safeParse(projects).success).toBe(true)
  })
  it('rejects a live project with no links', () => {
    const result = projectSchema.safeParse({ ...validProject, status: 'live', links: [] })
    expect(result.success).toBe(false)
  })
  it('rejects a duplicate slug', () => {
    const doubled = [validProject, { ...validProject, order: 9 }]
    expect(projectsSchema.safeParse(doubled).success).toBe(false)
  })
  it('rejects a duplicate order', () => {
    const doubled = [validProject, { ...validProject, slug: 'other' }]
    expect(projectsSchema.safeParse(doubled).success).toBe(false)
  })
  it('accepts the site config', () => {
    expect(siteSchema.safeParse(site).success).toBe(true)
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test`
Expected: FAIL, cannot resolve `./schema`

- [ ] **Step 3: Write `schema.ts`**

```ts
import { z } from 'zod'

export const projectStatusSchema = z.enum(['live', 'private', 'wip'])

export const projectLinkSchema = z.object({
  label: z.string().min(1),
  href: z.url(),
})

export const decisionSchema = z.object({
  heading: z.string().min(1),
  body: z.string().min(1),
})

export const projectSchema = z
  .object({
    slug: z.string().regex(/^[a-z0-9-]+$/),
    title: z.string().min(1),
    status: projectStatusSchema,
    hook: z.string().min(1),
    summary: z.string().min(1),
    stack: z.array(z.string().min(1)).min(1),
    screenshot: z.object({ src: z.string().min(1), alt: z.string().min(1) }),
    links: z.array(projectLinkSchema),
    featured: z.boolean(),
    order: z.number().int().nonnegative(),
    problem: z.string().optional(),
    role: z.string().optional(),
    architecture: z.string().optional(),
    decisions: z.array(decisionSchema).optional(),
    lessons: z.string().optional(),
  })
  .superRefine((project, ctx) => {
    if (project.status === 'live' && project.links.length === 0) {
      ctx.addIssue({
        code: 'custom',
        path: ['links'],
        message: 'A live project needs at least one link',
      })
    }
  })

export const projectsSchema = z
  .array(projectSchema)
  .superRefine((list, ctx) => {
    const slugs = new Set(list.map((p) => p.slug))
    const orders = new Set(list.map((p) => p.order))
    list.forEach((project, index) => {
      if (slugs.size !== list.length) {
        ctx.addIssue({ code: 'custom', path: [index, 'slug'], message: 'Duplicate slug' })
      }
      if (orders.size !== list.length) {
        ctx.addIssue({ code: 'custom', path: [index, 'order'], message: 'Duplicate order' })
      }
    })
  })

export const skillGroupSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  items: z.array(z.string().min(1)).min(1),
})

export const siteSchema = z.object({
  name: z.string().min(1),
  title: z.string().min(1),
  hook: z.string().min(1),
  avatar: z.object({ src: z.string().min(1), alt: z.string().min(1) }),
  resume: z.object({ href: z.string().min(1), filename: z.string().min(1) }),
  socials: z.array(z.object({ label: z.string().min(1), href: z.url() })),
  skills: z.array(skillGroupSchema).min(1),
})

export type ProjectStatus = z.infer<typeof projectStatusSchema>
export type Project = z.infer<typeof projectSchema>
export type SkillGroup = z.infer<typeof skillGroupSchema>
export type SiteConfig = z.infer<typeof siteSchema>
```

- [ ] **Step 4: Write `site.ts`**

Name "Ralph Ethan De Guzman", title "Software Engineer", interim hook
"Software engineer building full-stack web and cloud systems." Five skill groups:
Languages (Python, Java, C#, TypeScript, JavaScript, PHP, HTML5, CSS3, SQL);
Frameworks & Libraries (Next.js, React, Laravel, Flutter, Tailwind CSS, Express.js);
Backend & Databases (Node.js, MySQL, PostgreSQL, SQLite); Cloud & Platforms
(Azure Services, Firebase); Tools & Environments (Docker, Git, GitHub, Postman,
Android Studio). Socials start empty until URLs arrive.

- [ ] **Step 5: Write `projects.ts` with three stubs**

Real slugs, `status: 'wip'`, `featured: false`, so the grid shows its empty state
until real content lands. Screenshot `alt` describes the intended shot, not "screenshot".

- [ ] **Step 6: Run the test to verify it passes**

Run: `npm test`
Expected: PASS, 5 tests

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: add typed content layer with zod validation"
```

---

### Task 4: Shell

**Files:**
- Create: `src/components/nav.tsx`
- Create: `src/components/footer.tsx`
- Create: `src/components/section.tsx`
- Modify: `src/app/layout.tsx`, `src/app/page.tsx`

**Interfaces:**
- Produces: `Section({ id, eyebrow, title, children })` for consistent section framing

- [ ] **Step 1: Write `section.tsx`**

A server component taking an optional `eyebrow` rendered in Azeret Mono small caps
with the accent colour, a `title` in Anybody, and children. One `<section>` with
`aria-labelledby` pointing at the title's id.

- [ ] **Step 2: Write `nav.tsx` and `footer.tsx`**

Server components. Nav anchors to section ids. Footer carries socials and a
copyright line. Both skip rendering a link when its target is empty.

- [ ] **Step 3: Add the skip link and landmarks in `layout.tsx`**

First focusable element is an anchor to `#main`. One `<main id="main">`.

- [ ] **Step 4: Verify**

Run: `npm run typecheck && npm run build`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add page shell with nav, footer, and section primitive"
```

---

### Task 5: Hero and motion

**Files:**
- Create: `src/components/hero.tsx`
- Create: `src/components/hero-motion.tsx`
- Modify: `src/app/page.tsx`, `src/app/globals.css`

**Interfaces:**
- Produces: `Hero()` server component rendering static content
- Produces: `HeroMotion({ children })` client island

- [ ] **Step 1: Leave the hidden initial state out of CSS**

Do not add `[data-anim] { opacity: 0 }` to `globals.css`, even inside a
`@media (prefers-reduced-motion: no-preference)` block. A browser with JavaScript
disabled reports `no-preference`, so the rule would apply and nothing would ever
reveal the hero, leaving it blank. Step 2 applies the from-state from the script
instead, before paint.

- [ ] **Step 2: Write `hero-motion.tsx`**

```tsx
'use client'

import { useEffect, useLayoutEffect, useRef } from 'react'
import { createTimeline, stagger, utils } from 'animejs'

const useIsomorphicLayoutEffect =
  typeof window !== 'undefined' ? useLayoutEffect : useEffect

export function HeroMotion({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)

  useIsomorphicLayoutEffect(() => {
    const root = ref.current
    if (!root) return

    const targets = root.querySelectorAll<HTMLElement>('[data-anim]')
    if (targets.length === 0) return

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return
    }

    utils.set(targets, { opacity: 0, translateY: 28 })

    const timeline = createTimeline({
      defaults: { ease: 'outExpo', duration: 700 },
    })

    timeline
      .add(targets, { opacity: [0, 1], translateY: [28, 0], delay: stagger(90) }, 0)
      .init()

    return () => {
      timeline.revert()
    }
  }, [])

  return <div ref={ref}>{children}</div>
}
```

- [ ] **Step 3: Verify the v4 API against installed types**

Run `npm run typecheck`. If `createTimeline`, `utils.set`, or `revert` do not match
the installed Anime.js v4 surface, read the package's own type definitions and adjust.
Do not fall back to v3 syntax, since v3 is not installed.

- [ ] **Step 4: Write `hero.tsx`**

Name in Anybody at a controlled width, title beneath it, hook, then two actions:
"View My Work" as a solid accent button, "Download Resume" as a hairline button with
the `download` attribute. Mark animated elements with `data-anim`.

- [ ] **Step 5: Verify in the browser**

Run `npm run dev`. Then check all three paths, because two of them are the whole
point of the approach:

- Normal: the hero staggers in, and every target reaches opacity 1
- `prefers-reduced-motion: reduce`: the hero is fully visible and never animates
- **JavaScript disabled: the hero is fully visible.** This is the case a CSS
  hidden state breaks, and it needs its own browser context to test:

```ts
const ctx = await browser.newContext({ javaScriptEnabled: false })
const page = await ctx.newPage()
await page.goto('http://localhost:3000')
// assert every [data-anim] target computes to opacity 1
```

Screenshot each case.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: add animated hero with reduced-motion fallback"
```

---

### Task 6: Projects grid

**Files:**
- Create: `src/components/projects.tsx`
- Create: `src/components/project-card.tsx`
- Modify: `src/app/page.tsx`

**Interfaces:**
- Consumes: `projects: Project[]` from `src/lib/content/projects.ts`
- Produces: `ProjectCard({ project }: { project: Project })`

- [ ] **Step 1: Write `project-card.tsx`**

Server component. Renders the status badge from a `status` to label and colour map
(`live` accent, `private` muted, `wip` amber). The link row renders only when
`links` is non-empty, so no dead buttons ship.

- [ ] **Step 2: Write `projects.tsx`**

Maps `projects.filter((p) => p.featured)` sorted by `order`. When the filtered list
is empty, render an invitation to get in touch rather than an empty grid.

- [ ] **Step 3: Verify**

Run: `npm run typecheck && npm run build`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: add projects grid with status badges"
```

---

### Task 7: Project detail pages

**Files:**
- Create: `src/app/projects/[slug]/page.tsx`
- Create: `src/components/project-detail.tsx`

**Interfaces:**
- Consumes: `projects` and `Project`
- Produces: static routes at `/projects/[slug]`

- [ ] **Step 1: Write `project-detail.tsx`**

One shared template. Render `summary`, then each of `problem`, `role`,
`architecture`, `decisions`, and `lessons` only when present. Hide the heading
along with the body so no empty section label survives.

- [ ] **Step 2: Write the route**

`generateStaticParams` maps every slug to a params object. `generateMetadata` builds
the title and description from the project's hook and summary. Call `notFound()` on
an unknown slug.

- [ ] **Step 3: Verify**

Run: `npm run build`
Expected: PASS, one static path per project. A malformed slug fails the build here,
which makes the build itself a test.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: add project detail pages"
```

---

### Task 8: Skills

**Files:**
- Create: `src/components/skills.tsx`
- Modify: `src/app/page.tsx`

**Interfaces:**
- Consumes: `site.skills: SkillGroup[]`

- [ ] **Step 1: Write `skills.tsx`**

Five groups. Group label in Azeret Mono small caps, items as hairline-bordered chips
in Satoshi. No logo wall.

- [ ] **Step 2: Verify**

Run: `npm run typecheck && npm run build`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat: add skills section"
```

---

### Task 9: Halt for review

Do not start Plan 2 until the user has reviewed the running site. Palette, type, and
layout remain one-file changes at this point.

---

# Plan 2: Contact, Assets, Deploy

### Task 10: Environment, Resend, rate limiting

**Files:**
- Create: `.env.example`, `src/lib/env.ts`, `src/lib/resend.ts`, `src/lib/rate-limit.ts`
- Test: `src/lib/rate-limit.test.ts`

`env.ts` reads `CONTACT_EMAIL`, `RESEND_API_KEY`, and `CONTACT_FROM`, and throws at
import when a required variable is missing so a misconfigured deploy fails loudly.
`rate-limit.ts` is a per-IP token bucket at roughly 5 per hour, keyed on
`x-forwarded-for`. It stops naive scripted spam only. It resets on cold start and
will not stop a determined attacker, because Vercel instances are ephemeral. The site
must not claim otherwise.

### Task 11: Server Action

**Files:**
- Create: `src/app/actions/contact.ts`
- Test: `src/app/actions/contact.test.ts`

Order of operations: read FormData, honeypot check returning fake success, rate limit,
env check, Zod `safeParse`, then Resend. Returns a discriminated union and never
throws to the client.

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

The destination address never enters the client bundle. Six tests: malformed email,
short message, populated honeypot, missing env, rate limit exceeded, and a happy path.

### Task 12: Contact form UI

**Files:**
- Create: `src/components/contact-form.tsx`, `src/components/contact-section.tsx`

`useActionState` drives pending and field errors. Disable the button while pending.
When `CONTACT_EMAIL` is unset, render a friendly notice and send nothing. Errors link
to inputs through `aria-describedby`, and the summary carries `role="alert"`.

### Task 13: Assets and OG image

**Files:**
- Create: `public/resume.pdf`, `public/avatar.jpg`, `public/projects/<slug>.png`
- Create: `src/app/opengraph-image.tsx`

Absence has a defined fallback: the resume button renders disabled, the avatar falls
back to initials in a circle, and a missing screenshot falls back to a neutral tinted
block.

### Task 14: Accessibility pass and deploy

Run `npm run typecheck`, `npm run lint`, `npm test`, `npm run build`. Check keyboard
order, visible focus, reduced motion, and alt text. Then deploy to Vercel, attach the
domain, and complete Resend sending-domain DNS verification. The contact form cannot
deliver real mail until that DNS step is done.

---

## Addendum: content, icon and atmosphere pass (2026-09-26)

The spiral marks described above are no longer brand-coloured logos on a light
plate, and the skill set is no longer 25. Three further documents record the
current state, and they win over this log where the two disagree:

- `docs/superpowers/specs/2026-09-26-ralph-portfolio-atmosphere-design.md` — the
  approved design for the content, icon and hero changes.
- `docs/superpowers/plans/2026-09-26-ralph-portfolio-atmosphere.md` — the task
  breakdown that was executed.
- `docs/superpowers/specs/2026-09-26-ralph-portfolio-design.md` — the standing
  design record, which is the authoritative source for how the site looks now.

What changed, in short: the skill list is the 23 entries that have a brand mark
(`SQL`, `Azure Services` and the whole cloud group were removed); each mark
carries its own fill at full bleed with no plate, and `logo-colors.test.ts` holds
all 23 above 3:1 on the `#17171c` card; section copy is warmer and the visible
naming is Work rather than Projects; and the hero gained a gradient wash, three
drifting glow blobs and a `SoftAurora` band in place of its bottom border.
