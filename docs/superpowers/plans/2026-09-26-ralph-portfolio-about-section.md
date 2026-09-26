# About Section, Relocated Aurora, Ember Actions Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an About section carrying the soft aurora band, fix the band's width bug, and give the Hero and Contact actions an ember colour instead of the brand blue.

**Architecture:** One new presentational component (`about.tsx`), one new zod schema field for its copy, and one new optional prop on the shared `Section` that splits the reading column so a decorative layer can be full-bleed inside a content gap. The aurora moves rather than duplicates, so the page still runs three canvases.

**Tech Stack:** Next.js App Router, React 19, TypeScript, Tailwind CSS v4 (`@theme inline` tokens), zod, vitest, `ogl` (WebGL 2) for `Grainient` and `SoftAurora`.

**Spec:** `docs/superpowers/specs/2026-09-26-ralph-portfolio-about-section-design.md` — the plan argues from the spec, so the spec travels with it; executors read both.

## Global Constraints

- Exact token values, from the spec's measured table: `--color-ember: #e08a3c` (7.50:1 with `--color-bg` text), `--color-ember-bright: #f0a95e` (10.05:1 with `--color-bg` text).
- `--color-status-wip` is **renamed** to `--color-ember`, not duplicated. Its only consumer is `src/components/project-card.tsx:29`.
- Approved About copy is **360 characters / 68 words**. The schema cap is `.max(400)`, set from that measurement. Do not "tidy" the cap to a rounder number.
- `aboutSchema.paragraphs` is `.min(1)`, not `.min(2)`. The approved copy is a single paragraph.
- The band spacer is exactly `h-[120px]` and is the paragraph's top margin. The body gets no margin of its own.
- `brightness={1.0}` on the About `SoftAurora`, with `color1="#9ec4ff" color2="#4169e1" bandHeight={0.7}`. **Revised during execution** — see Deviations below.
- Sections renumber: About `01`, Projects `02`, Skills `03`, Contact `04`. **Revised during execution** — see Deviations below.
- The `.section-wash` wrapper in `page.tsx` stays scoped to Projects + Skills. About is a sibling, not a child — placed *before* the wrapper.
- Comment style in this codebase is dense and explains *why*, including what breaks and what was measured. Match it; do not add comments that restate the code.
- TypeScript is `noUnusedLocals`-clean. Every import added is used or it is a build failure.
- No new dependencies. No DOM-testing library — the suite is pure Node, so behavioural checks run through vitest only for pure functions, and decorative geometry is verified in the browser.

---

## Deviations from this plan

This plan was executed, then adjusted twice on request. The task steps below are
left as written so they record what was actually run; the shipped result differs
in three places.

1. **About moved above Work.** The plan places About between Skills and
   Contact. It shipped directly after the Hero, before Work, so the order is
   Hero -> About -> Work -> Skills -> Contact and the indices are About `01`,
   Work `02`, Skills `03`, Contact `04`. The nav follows the section order.
   `.section-wash` still wraps only Work + Skills, so About became a sibling
   *before* that wrapper instead of after it.
2. **Aurora brightened.** The plan's `color1="#9db4e3" color2="#4d6fd1"
   brightness={0.5}` read as a faint smudge in review. Shipped as
   `color1="#9ec4ff" color2="#4169e1" brightness={1.0} bandHeight={0.7}`. The
   prose still clears the contrast gate at 5.93:1.
3. **One contrast gate waived.** The hero's outlined "Download resume" button
   measures 4.37:1, marginally under the 4.5:1 target. Reviewed and accepted
   rather than fixed; the two candidate fixes are recorded in the spec. Every
   other measured element passes.

The spec is the source of truth for all three.

---

## File Structure

| File | Status | Responsibility |
| ---- | ------ | -------------- |
| `src/app/globals.css` | modify | ember tokens, `.aurora-band` width + mask fix, nav comment |
| `src/lib/content/schema.ts` | modify | `aboutSchema` + `about` on `siteSchema` |
| `src/lib/content/site.ts` | modify | the `about` copy |
| `src/lib/content/schema.test.ts` | modify | About content tests |
| `src/components/section.tsx` | modify | `midSlot` prop, split reading column |
| `src/components/about.tsx` | **create** | the About section |
| `src/components/contact.tsx` | modify | renumber to `04`, ember tiles/email, drop the aurora |
| `src/components/hero.tsx` | modify | ember primary + secondary |
| `src/components/project-card.tsx` | modify | `status-wip` -> `ember` |
| `src/components/gooey-nav.tsx` | modify | About link |
| `src/app/page.tsx` | modify | render `<About />` |
| `docs/superpowers/specs/2026-09-26-ralph-portfolio-grainient-design.md` | modify | supersession note |
| `docs/superpowers/specs/2026-09-26-ralph-portfolio-design.md` | modify | token list |

Ordering rationale: the CSS token rename comes first because it is a pure
rename with one consumer, so it is independently reviewable. The `Section` API
lands before `about.tsx` because the new component cannot compile without
`midSlot`. Copy and schema precede the component so the content is validated
before anything renders it.

---

### Task 1: Ember tokens

**Files:**
- Modify: `src/app/globals.css:30-31`
- Modify: `src/components/project-card.tsx:29`

**Interfaces:**
- Consumes: nothing.
- Produces: CSS custom properties `--color-ember` and `--color-ember-bright`, and therefore the Tailwind utilities `bg-ember`, `text-ember`, `border-ember`, `bg-ember-bright`, `text-ember-bright`, `border-ember-bright`. Consumed by Tasks 3 and 4.

- [ ] **Step 1: Rename the token and add the bright step**

In `src/app/globals.css`, replace lines 30-31:

```css
  /* Amber is incomplete, and nothing else */
  --color-status-wip: #e08a3c;
```

with:

```css
  /* Amber is the action colour: hero and contact buttons, and the WIP chip.
     Two steps for the same reason the blue ramp has two — `#e08a3c` clears
     7.50:1 as a fill with background-coloured text, but the hero's secondary
     button and the contact email hover sit on the moving Grainient and dot-grid
     fields rather than on flat background, and a live field raises the effective
     background luminance. `#f0a95e` at 10.05:1 buys that headroom.

     Renamed from `status-wip`, which described one chip rather than a role. */
  --color-ember: #e08a3c;
  --color-ember-bright: #f0a95e;
```

- [ ] **Step 2: Update the only consumer**

In `src/components/project-card.tsx:29`, replace:

```tsx
className: "border-status-wip text-status-wip",
```

with:

```tsx
className: "border-ember text-ember",
```

- [ ] **Step 3: Confirm no reference to the old name survives**

Run: `rg -n "status-wip|statusWip" src/`

Expected: no output. A hit means a consumer was missed; the token no longer exists, so the class silently becomes a no-op rather than erroring.

- [ ] **Step 4: Run the gates**

Run: `npx tsc --noEmit`

Expected: exit 0.

Run: `npx eslint src --max-warnings=0`

Expected: exit 0.

- [ ] **Step 5: Commit**

```bash
git add src/app/globals.css src/components/project-card.tsx
git commit -m "refactor(tokens): rename status-wip to ember and add a bright step"
```

---

### Task 2: The band width fix

**Files:**
- Modify: `src/app/globals.css:351-357`

**Interfaces:**
- Consumes: nothing.
- Produces: a `.aurora-band` class that spans its full container and feathers at both ends. Consumed by Task 5.

- [ ] **Step 1: Write the failing geometry check**

This is a browser assertion, not a vitest case — the band is a rendered layer and the suite has no DOM. Run it against the dev server (`npm run dev`, `http://localhost:3000`) before touching the CSS, and confirm it fails:

```js
async (page) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('http://localhost:3000/', { waitUntil: 'load' });
  await page.waitForTimeout(2500);
  return await page.evaluate(() => {
    const band = document.querySelector('.aurora-band');
    const section = band?.closest('section');
    if (!band || !section) return { error: 'missing' };
    return {
      band: Math.round(band.getBoundingClientRect().width),
      section: Math.round(section.getBoundingClientRect().width),
    };
  });
}
```

Expected **before** the fix: `band: 300`, `section: 1425`. This is the bug: 300px is a `<canvas>`'s intrinsic default width, because the invalid `inset-x: 0` declaration was dropped and the band shrink-wrapped its content.

- [ ] **Step 2: Fix the property and the mask**

In `src/app/globals.css`, replace the `.aurora-band` rule:

```css
.aurora-band {
  position: absolute;
  inset-x: 0;
  bottom: 0;
  height: 150px;
  -webkit-mask-image: linear-gradient(to top, #000 58%, transparent 100%);
  mask-image: linear-gradient(to top, #000 58%, transparent 100%);
}
```

with:

```css
.aurora-band {
  position: absolute;
  /* `inset-inline`, not `inset-x`. `inset-x` is a Tailwind *utility class*
     name and is not a property here, so the browser drops the declaration and
     the band collapses to its canvas's 300px intrinsic width. */
  inset-inline: 0;
  bottom: 0;
  height: 150px;
  /* Feathers at both ends. This band used to sit at the foot of the contact
     section, where a top-only fade was enough because nothing was below it. It
     now sits in a gap between a heading and a paragraph, and a hard edge
     against either one reads as a seam. */
  -webkit-mask-image: linear-gradient(
    to bottom,
    transparent 0%,
    #000 30%,
    #000 70%,
    transparent 100%
  );
  mask-image: linear-gradient(
    to bottom,
    transparent 0%,
    #000 30%,
    #000 70%,
    transparent 100%
  );
}
```

- [ ] **Step 3: Re-run the geometry check**

Expected **after**: `band` within a few px of `section` (1425). Anything near 300 means the declaration is still being dropped.

- [ ] **Step 4: Run the gates**

Run: `npx tsc --noEmit && npx eslint src --max-warnings=0`

Expected: both exit 0. (No TypeScript changed here; this is a behavioural check, so the browser assertion above is the real gate.)

- [ ] **Step 5: Commit**

```bash
git add src/app/globals.css
git commit -m "fix(aurora): span the full container and feather both band edges"
```

---

### Task 3: Ember buttons

**Files:**
- Modify: `src/components/hero.tsx:48-62`
- Modify: `src/components/contact.tsx:95-128`

**Interfaces:**
- Consumes: `bg-ember`, `text-bg`, `bg-ember-bright`, `border-ember`, `text-ember-bright`, `border-ember-bright` from Task 1.
- Produces: no new exports. Visual only.

- [ ] **Step 1: Recolour the hero primary button**

In `src/components/hero.tsx`, replace the `View my work` anchor's `className`:

```tsx
className="rounded-full bg-ember px-6 py-3 font-mono text-xs uppercase tracking-[0.12em] text-bg transition-colors hover:bg-ember-bright"
```

- [ ] **Step 2: Recolour the hero secondary button**

In the same file, replace the `Download resume` anchor's `className`:

```tsx
className="rounded-full border border-ember px-6 py-3 font-mono text-xs uppercase tracking-[0.12em] text-ember-bright transition-colors hover:border-ember-bright"
```

- [ ] **Step 3: Extend the hero's comment to cover the new colour**

In `src/components/hero.tsx:46-47`, replace:

```tsx
{/* The two pills are the only rounded shapes in the hero, kept as a
    deliberate organic note against the shader's soft field. */}
```

with:

```tsx
{/* The two pills are the only rounded shapes in the hero, kept as a
    deliberate organic note against the shader's soft field.

    Amber rather than the brand blue: blue is this site's `actionable`
    colour, so a blue button was the same colour as every link and eyebrow
    around it and sank into the shader. The measured ratios are in
    `globals.css`. */}
```

- [ ] **Step 4: Fill the contact tiles**

In `src/components/contact.tsx`, replace **both** tile `className`s (the `socials` map at line 111 and the résumé `<li>` at line 123) — they are currently identical strings, so use `replaceAll`:

```tsx
className="block bg-ember px-4 py-3 text-center font-mono text-xs uppercase tracking-[0.12em] text-bg transition-colors hover:bg-ember-bright"
```

Then update the comment at `contact.tsx:99-105` to record the intent, replacing the `max-w-md` paragraph with:

```tsx
{/* `max-w-md` because the portrait column is fixed, which leaves the
    actions roughly 1080px to fill at 1440. Left uncapped the three
    tiles spread to a third of the screen each and stop reading as a
    set; `mx-auto` pulls the capped row back to the centre.

    Filled rather than outlined: these are the last actionable things on
    the page, and they were the least visible thing on it. Outlined blue
    on a dark field measured 4.68:1 and read as background. */}
```

- [ ] **Step 5: Recolour the contact email hover**

In `src/components/contact.tsx:97`, replace:

```tsx
className="type-display break-all text-lg text-fg underline-offset-[6px] transition-colors hover:text-accent-bright hover:underline md:text-2xl"
```

with:

```tsx
className="type-display break-all text-lg text-fg underline-offset-[6px] transition-colors hover:text-ember-bright hover:underline md:text-2xl"
```

- [ ] **Step 6: Run the gates**

Run: `npx tsc --noEmit && npx eslint src --max-warnings=0 && npm test`

Expected: all exit 0; 25 tests pass.

- [ ] **Step 7: Commit**

```bash
git add src/components/hero.tsx src/components/contact.tsx
git commit -m "feat(actions): move hero and contact actions from blue to ember"
```

---

### Task 4: About content

**Files:**
- Modify: `src/lib/content/schema.ts` (add `aboutSchema` after `socialLinkSchema`, add `about` to `siteSchema` near line 105, add the `About` type export near line 117)
- Modify: `src/lib/content/site.ts` (add the `about` key)
- Test: `src/lib/content/schema.test.ts`

**Interfaces:**
- Consumes: nothing.
- Produces: `aboutSchema` (zod), type `About = { heading: string; paragraphs: string[]; interests: string[] }`, and `site.about`. Consumed by Task 5.

- [ ] **Step 1: Write the failing tests**

Append to `src/lib/content/schema.test.ts`:

```ts
describe("about copy", () => {
  it("has at least one paragraph", () => {
    expect(site.about.paragraphs.length).toBeGreaterThan(0);
  });

  it("keeps every paragraph inside the schema's length cap", () => {
    // The cap exists to stop this becoming a wall of text. Asserting it here as
    // well as in the schema means a raised cap has to be a deliberate edit in
    // two places rather than a silent loosening.
    for (const paragraph of site.about.paragraphs) {
      expect(
        paragraph.length,
        `paragraph is ${paragraph.length} chars, over the 400 cap`,
      ).toBeLessThanOrEqual(400);
    }
  });

  it("has no blank paragraphs or interests", () => {
    const blanks = [
      ...site.about.paragraphs,
      ...site.about.interests,
    ].filter((value) => value.trim().length === 0);
    expect(blanks).toEqual([]);
  });

  it("rejects an about block with no paragraphs", () => {
    const result = siteSchema.safeParse({
      ...site,
      about: { ...site.about, paragraphs: [] },
    });
    expect(result.success).toBe(false);
  });

  it("rejects a paragraph over the length cap", () => {
    const result = siteSchema.safeParse({
      ...site,
      about: { ...site.about, paragraphs: ["x".repeat(401)] },
    });
    expect(result.success).toBe(false);
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npm test`

Expected: FAIL. `site.about` is `undefined`, so the first four throw on property access and `siteSchema` does not know about `about` yet.

- [ ] **Step 3: Add the schema**

In `src/lib/content/schema.ts`, after the `socialLinkSchema` block, add:

```ts
export const aboutSchema = z.object({
  heading: z.string().min(1),
  /**
   * An array even though the approved copy is a single paragraph, so the copy
   * can be split later without a schema or type change.
   *
   * The 400 cap is measured rather than guessed: the approved copy is 360
   * characters. It lives in the schema rather than only in a test so the limit
   * is enforced when the content is parsed.
   */
  paragraphs: z.array(z.string().min(1)).min(1).max(400),
  /** Plain text, not links: a hobby is not a destination. */
  interests: z.array(z.string().min(1)).default([]),
});
```

Then add `about: aboutSchema,` to `siteSchema`, directly after `skills:`:

```ts
  skills: z.array(skillGroupSchema).min(1),
  about: aboutSchema,
```

Then add the type export alongside the others:

```ts
export type About = z.infer<typeof aboutSchema>;
```

- [ ] **Step 4: Add the content**

In `src/lib/content/site.ts`, add the `about` key after `skills`:

```ts
  /**
   * Drafted prose, and the author's to edit. It deliberately asserts no
   * location, years of experience, employer or education: none of that was
   * supplied, and inventing it would be fabrication rather than placeholder.
   */
  about: {
    heading: "A bit about me",
    paragraphs: [
      "I'm Ethan, a software engineer who builds for the web. I like turning rough ideas into things you can actually click, and I care about the details in between — the type that lines up, the state that behaves. Away from the editor you'll find me on a basketball court or out for a run, usually still turning over whatever problem I was stuck on the night before.",
    ],
    interests: ["Basketball", "Running", "Coding"],
  },
```

- [ ] **Step 5: Run the tests to verify they pass**

Run: `npm test`

Expected: PASS, 30 tests (25 existing + 5 new).

- [ ] **Step 6: Run the remaining gates**

Run: `npx tsc --noEmit && npx eslint src --max-warnings=0`

Expected: both exit 0.

- [ ] **Step 7: Commit**

```bash
git add src/lib/content/schema.ts src/lib/content/site.ts src/lib/content/schema.test.ts
git commit -m "feat(content): add validated About copy"
```

---

### Task 5: The `midSlot` prop on `Section`

**Files:**
- Modify: `src/components/section.tsx:1-88`

**Interfaces:**
- Consumes: nothing.
- Produces: `Section` gains `midSlot?: React.ReactNode`, rendered as a full-width `h-[120px]` spacer between the header block and the children. Consumed by Task 6.

- [ ] **Step 1: Split the content wrapper**

In `src/components/section.tsx`, the header and the children currently share one `max-w-5xl` wrapper (lines 65-85). Replace that whole block with:

```tsx
      {/* Two reading columns rather than one wrapper around everything. The gap
          between them is a full-width spacer, which is the only arrangement that
          satisfies both of `midSlot`'s requirements at once: the layer has to sit
          *between* the header and the body, and it has to be full-bleed. A layer
          placed inside a single reading column can only ever be 976px, and
          forcing it wider from in there needs negative insets plus
          `overflow-x: clip` on the section.

          The spacer being a direct child of `<section>` is what makes `w-full`
          mean the section's full width, and it is also the paragraph's top
          margin, so the body needs none of its own. Both columns are `relative`
          for the same reason the single wrapper was: they have to sit above the
          backdrop in the paint order. */}
      <div className="relative mx-auto w-full max-w-5xl px-6">
        <div className="flex items-baseline gap-4 border-b border-line pb-4">
          <span className="font-mono text-xs text-accent-bright">{index}</span>
          <p className={`type-eyebrow ${supporting}`}>{eyebrow}</p>
        </div>

        <h2
          id={`${id}-title`}
          className="type-display mt-6 text-3xl text-fg md:text-4xl"
        >
          {title}
        </h2>

        {lede ? (
          <p className={`mt-4 max-w-2xl leading-relaxed ${supporting}`}>
            {lede}
          </p>
        ) : null}
      </div>

      {midSlot ? (
        <div aria-hidden className="relative h-[120px] w-full">
          {midSlot}
        </div>
      ) : null}

      <div className="relative mx-auto w-full max-w-5xl px-6">{children}</div>
```

- [ ] **Step 2: Declare the prop**

In the same file's parameter destructuring, add `midSlot,` after `backdrop,`. Then add the type, after the `backdrop?: React.ReactNode;` declaration:

```tsx
  /**
   * A decorative layer rendered in the gap between the header and the body, in a
   * full-width spacer. Unlike `backdrop` it is *not* clipped to the section and
   * is positioned in normal flow, so a layer placed here can run to the
   * section's edges. `About` uses it for the soft aurora band.
   *
   * The spacer is `aria-hidden` and the caller is responsible for making its
   * contents pointer-transparent; nothing decorative should be reachable.
   */
  midSlot?: React.ReactNode;
```

- [ ] **Step 3: Verify the refactor changed no existing section**

Run: `npm run dev`, open `http://localhost:3000/`, and compare Work, Skills and Contact against the pre-change rendering.

Expected: identical. `midSlot` is optional and absent from all three, so the only difference is one extra wrapper element. In particular the header border, the title, the lede and the children's spacing are unchanged.

Run: `npx tsc --noEmit && npx eslint src --max-warnings=0 && npm test`

Expected: all exit 0; 30 tests pass.

- [ ] **Step 4: Commit**

```bash
git add src/components/section.tsx
git commit -m "feat(section): add midSlot for full-bleed layers in a content gap"
```

---

### Task 6: The About section

**Files:**
- Create: `src/components/about.tsx`

**Interfaces:**
- Consumes: `Section`'s `midSlot` prop (Task 5), `site.about` (Task 4), `SoftAurora` (existing, `src/components/soft-aurora.tsx`).
- Produces: `export function About(): JSX.Element`, mounted by Task 7.

- [ ] **Step 1: Create the component**

Create `src/components/about.tsx`:

```tsx
import { Section } from "./section";
import SoftAurora from "./soft-aurora";
import { site } from "@/lib/content/site";

/**
 * The About section, and the aurora band's new home.
 *
 * The band used to sit at the foot of the contact section, where nothing was
 * below it and a top-only fade was enough to hide its lower edge. It reads
 * better in a gap: a full-bleed streak between the heading and the body, with
 * the copy on either side of it rather than above it.
 *
 * No `lede`. That is deliberate — with no supporting line under the title, the
 * band sits literally between the title and the body, which is where it was
 * asked for. The paragraph takes no top margin either: the 120px spacer is the
 * gap.
 */
export function About() {
  return (
    <Section
      id="about"
      index="03"
      eyebrow="About me"
      title={site.about.heading}
      midSlot={
        /* `brightness` is halved because this band sits in a content column
           rather than at the foot of a section, so it has to stay quiet enough
           to read as background behind real prose. It is the first thing to
           raise if it looks faint in review. */
        <div className="aurora-band">
          <SoftAurora
            color1="#9db4e3"
            color2="#4d6fd1"
            brightness={0.5}
          />
        </div>
      }
    >
      {/* `max-w-2xl` rather than the full 5xl: a single paragraph across 976px
          is a 100-character measure, which is too long to read comfortably. */}
      <div className="max-w-2xl">
        {site.about.paragraphs.map((paragraph) => (
          <p key={paragraph} className="leading-relaxed text-muted">
            {paragraph}
          </p>
        ))}

        {/* Plain text, not links. Rendered in the same mono-uppercase register
            as the section eyebrows and the contact tiles, so it reads as part
            of the page's type system rather than as a list pasted in. */}
        <ul className="mt-10 flex flex-wrap gap-x-6 gap-y-2">
          {site.about.interests.map((interest) => (
            <li
              key={interest}
              className="font-mono text-xs uppercase tracking-[0.12em] text-muted-bright"
            >
              {interest}
            </li>
          ))}
        </ul>
      </div>
    </Section>
  );
}
```

- [ ] **Step 2: Run the gates**

Run: `npx tsc --noEmit && npx eslint src --max-warnings=0 && npm test`

Expected: all exit 0; 30 tests pass.

- [ ] **Step 3: Commit**

```bash
git add src/components/about.tsx
git commit -m "feat(about): add the About section with the relocated aurora band"
```

The component is not mounted yet, so nothing renders it. That is deliberate —
Task 7 mounts it, and reviewing an unmounted component keeps this commit to one
concern.

---

### Task 7: Mount About, renumber, and drop Contact's aurora

**Files:**
- Modify: `src/app/page.tsx:1-26`
- Modify: `src/components/gooey-nav.tsx:7-12`
- Modify: `src/components/contact.tsx:5, 26-63`
- Modify: `src/app/globals.css:149-153` (the four-labels comment)

**Interfaces:**
- Consumes: `About` (Task 6).
- Produces: a page with five nav links and sections `01`–`04`.

- [ ] **Step 1: Add the About link to the nav**

In `src/components/gooey-nav.tsx`, replace the `links` array:

```tsx
const links = [
  { href: "#top", label: "Home" },
  { href: "#work", label: "Work" },
  { href: "#skills", label: "Skills" },
  { href: "#about", label: "About" },
  { href: "#contact", label: "Contact" },
];
```

The `Home` entry's comment above the array still holds: it resolves to the hero
and the observer picks it up like any other target.

- [ ] **Step 2: Correct the four-labels comment**

In `src/app/globals.css`, find the comment inside the `max-width: 639px` block
that ends with "Four labels at this size stay inside 320px." and replace that
sentence with:

```
Five labels stay inside 320px at this size, but only just — the measured
         width is ~257px against 272px available, so this is verified rather
         than assumed. Widening the labels or the padding here will overflow.
```

- [ ] **Step 3: Mount About in the page**

In `src/app/page.tsx`, add the import:

```tsx
import { About } from "@/components/about";
```

(alphabetically before `Contact`.) Then add `<About />` between the wash
wrapper and `<Contact />`:

```tsx
      <About />
      <Contact />
```

The wash wrapper is deliberately **not** extended over About. It currently
wraps Projects and Skills only, and that is correct: About hosts an animated
band, and a static gradient under an animated band in one section is two
competing effects. Update the wrapper's comment to say so, replacing lines
12-17 with:

```tsx
      {/* Work and Skills share one static wash between them rather than each
          carrying its own animated blobs. It is the same decoration appearing
          twice, and this page already runs a shader in the hero, one band in
          About and a dot grid in the contact section. `relative` is
          load-bearing: the wash is absolutely positioned, and the sections
          above and below it are too, so this wrapper is what keeps the wash
          from stretching to the page.

          The wash stops here on purpose. About has its own animated band, and
          stacking a static gradient under a moving one in the same section is
          two effects competing rather than one composing. */}
```

- [ ] **Step 4: Renumber Contact**

In `src/components/contact.tsx:30`, replace `index="03"` with `index="04"`.

- [ ] **Step 5: Remove Contact's aurora**

In `src/components/contact.tsx`, delete the import on line 5:

```tsx
import SoftAurora from "./soft-aurora";
```

and delete the band block at lines 55-61:

```tsx
          {/* `SoftAurora` is `h-full w-full`, so it needs a sized parent; the
              band's mask fades the canvas rectangle out at the top edge, which
              is what stops it showing as a hard horizontal line. */}
          <div className="aurora-band">
            <SoftAurora color1="#9db4e3" color2="#4d6fd1" />
          </div>
```

- [ ] **Step 6: Update Contact's doc comment**

In `src/components/contact.tsx:19-24`, replace the paragraph about the aurora
with:

```tsx
 * The dot lattice and the gradient blobs live here rather than in the hero,
 * which is a single shader: stacking a lattice, a band and three drifting blobs
 * on top of it was the most expensive thing on the page. The aurora band that
 * used to sit here has moved to the About section, so this backdrop is now two
 * layers rather than three.
```

- [ ] **Step 7: Run the gates**

Run: `npx tsc --noEmit && npx eslint src --max-warnings=0 && npm test`

Expected: all exit 0; 30 tests pass. An unused `SoftAurora` import in Contact
would fail the lint pass, which is the check that catches a missed deletion.

- [ ] **Step 8: Commit**

```bash
git add src/app/page.tsx src/components/gooey-nav.tsx src/components/contact.tsx src/app/globals.css
git commit -m "feat(about): mount the section, renumber contact, move the band"
```

---

### Task 8: Browser verification

**Files:** none. This task changes no files; it is the gate that proves Tasks
1-7.

**Interfaces:**
- Consumes: everything above.
- Produces: recorded measurements for the spec's verification section.

- [ ] **Step 1: Run the full machine gate suite**

Run:

```bash
npx tsc --noEmit
npx eslint src --max-warnings=0
npm test
npm run build
```

Expected: all exit 0. `npm test` reports 2 files and 30 tests. `npm run build`
lists `/`, three `/projects/*` routes and `/nope-404`.

- [ ] **Step 2: Verify band geometry against its container**

With the dev server running, at 1440x900 and 390x844:

```js
async (page) => {
  const out = [];
  for (const [w, h] of [[1440, 900], [390, 844]]) {
    await page.setViewportSize({ width: w, height: h });
    await page.goto('http://localhost:3000/', { waitUntil: 'load' });
    await page.waitForTimeout(2000);
    out.push(await page.evaluate((vp) => {
      const band = document.querySelector('.aurora-band');
      const section = band?.closest('section');
      if (!band || !section) return { vp, error: 'missing' };
      const b = band.getBoundingClientRect();
      const s = section.getBoundingClientRect();
      return {
        vp,
        band: Math.round(b.width),
        section: Math.round(s.width),
        bandHeight: Math.round(b.height),
        delta: Math.round(s.width - b.width),
      };
    }, `${w}x${h}`));
  }
  return out;
}
```

Expected: `delta` of 0-2px at both sizes. This is the assertion whose absence let
the 300px bug ship, so it is checked against the container and not for presence.

- [ ] **Step 3: Verify contrast across drift frames**

For About's heading, paragraph and interests row, and for the hero and contact
actions, measure the worst pixel inside each text rectangle across at least five
frames. Pin the rect on the first frame and **re-read it inside every frame** — a
stale rect yields plausible but wrong numbers, which is how an earlier 3.26:1
reading survived a round of verification.

For each element: `getBoundingClientRect()`, then walk pixels inside it, convert
to relative luminance, take the worst ratio against the text colour, and compare
to 4.5. Elements to cover:

| Element | Selector | Colour |
| ------- | -------- | ------ |
| About eyebrow | `#about .type-eyebrow` | `text-muted` |
| About heading | `#about h2` | `text-fg` |
| About paragraph | `#about p.leading-relaxed` | `text-muted` |
| About interests | `#about ul li` | `text-muted-bright` |
| Hero primary | `#top a[href="#work"]` | `text-bg` on `bg-ember` |
| Hero secondary | `#top a[download]` | `text-ember-bright` |
| Contact eyebrow | `#contact .type-eyebrow` | `text-muted-bright` (`onField`) |
| Contact title | `#contact h2` | `text-fg` |
| Contact lede | `#contact p.mt-4` | `text-muted-bright` (`onField`) |
| Contact email | `#contact a[href^="mailto"]` | `text-fg` |
| Contact tiles | `#contact ul a` | `text-bg` on `bg-ember` |

Expected: every value >= 4.5. If About's paragraph or heading falls short
because the band brightens the field behind it, raise `brightness` handling by
lowering the value further (0.4, then 0.3) before touching the text colour —
the copy should not change to accommodate a decoration.

- [ ] **Step 4: Verify no horizontal overflow and a fitting nav**

At 1440x900, 390x844 and 320x568, assert
`document.documentElement.scrollWidth <= clientWidth`, and measure the nav:

```js
await page.evaluate(() => {
  const list = document.querySelector('.gooey-nav__list');
  const header = document.querySelector('header > div');
  return {
    nav: Math.round(list.getBoundingClientRect().width),
    headerInner: Math.round(header.getBoundingClientRect().width),
    overflow: document.documentElement.scrollWidth >
      document.documentElement.clientWidth,
  };
});
```

Expected at 320px: `nav` <= `headerInner`, and `overflow: false`. The five labels
estimate to ~257px against 272px available. If it overflows, reduce
`.gooey-nav__link` padding below `sm` from `0.25rem 0.375rem` to
`0.25rem 0.25rem` — that reclaims ~20px across five labels — and re-measure
rather than assuming it was enough.

- [ ] **Step 5: Verify all routes and the canvas count**

For `/`, `/projects/securx`, `/projects/modern-homes`,
`/projects/ryb-vehicle-trading` and `/nope-404`, assert:

- `/nope-404` returns HTTP 404 and renders no `#about` or `#contact`.
- The other four render `#about` and `#contact`.
- On `/`, `document.querySelectorAll('canvas').length === 3` — the hero shader,
  the About band, the contact dot grid. Same total as before this change; the
  band moved rather than duplicated.
- On `/`, `#about .aurora-band` exists and `#contact .aurora-band` does not.
- No unexpected console errors on any route.

- [ ] **Step 6: Verify hidden-tab pausing still works after the move**

Set `document.hidden` via CDP or by opening a second tab, then count
`requestAnimationFrame` calls over 600ms in the About band. Expect a marked drop
from the visible-tab rate, matching the pre-change behaviour of `SoftAurora` in
Contact.

- [ ] **Step 7: Record the measurements**

Append a verification section to
`docs/superpowers/specs/2026-09-26-ralph-portfolio-about-section-design.md`
with the measured band widths, the contrast table, the 320px nav width, and the
canvas count. A gate whose result is not written down is a gate nobody can
re-check.

- [ ] **Step 8: Commit the verification record**

```bash
git add docs/superpowers/specs/2026-09-26-ralph-portfolio-about-section-design.md
git commit -m "docs(about): record band geometry, contrast and nav measurements"
```

---

### Task 9: Documentation

**Files:**
- Modify: `docs/superpowers/specs/2026-09-26-ralph-portfolio-grainient-design.md`
- Modify: `docs/superpowers/specs/2026-09-26-ralph-portfolio-design.md`

**Interfaces:**
- Consumes: the measurements from Task 8.
- Produces: no code.

- [ ] **Step 1: Point the Grainient spec at its successor**

In `docs/superpowers/specs/2026-09-26-ralph-portfolio-grainient-design.md`, add
to the header, after the `Supersedes:` line:

```
The structure and contact atmosphere sections are further superseded by
`2026-09-26-ralph-portfolio-about-section-design.md`, which adds an About
section and moves the aurora band into it. The `Grainient` component itself is
unchanged and this spec still governs it.
```

- [ ] **Step 2: Add the ember tokens to the design-system token list**

In `docs/superpowers/specs/2026-09-26-ralph-portfolio-design.md`, find the
revision note that lists the shipped tokens and add ember alongside
`muted-bright`, with the rationale: amber is the action colour because blue was
already `actionable` everywhere else, and it needs a bright step for text over
the two moving fields.

- [ ] **Step 3: Commit**

```bash
git add docs/superpowers/specs/2026-09-26-ralph-portfolio-grainient-design.md docs/superpowers/specs/2026-09-26-ralph-portfolio-design.md
git commit -m "docs: record the ember tokens and the About supersession"
```

---

## Self-Review

**Spec coverage.** Every section of the spec maps to a task: the band width bug
→ Task 2; decisions table → Tasks 1, 3, 5, 6, 7; structure and the wash
boundary → Task 7; `midSlot` → Task 5; the About section and its copy → Tasks 4
and 6; the content model → Task 4; ember actions and the measured ratios →
Tasks 1 and 3; verification → Task 8; out-of-scope items → deliberately
unimplemented.

**Placeholder scan.** No `TBD`, no "add appropriate error handling", no "similar
to Task N". Every code step carries literal content. The one place a value is
not precomputed is `--color-ember-bright`'s ratio, which is cited from the
measurement taken before the plan was written.

**Type consistency.** `midSlot` is declared and consumed in the same task that
introduces it. `site.about` is produced in Task 4 and first read in Task 6.
`About` is exported in Task 6 and imported in Task 7. `ember` / `ember-bright`
are created in Task 1 and used in Tasks 3 and 6. The `About` type is exported
alongside `skillGroupSchema`'s sibling exports and is not yet consumed by
anything, which `noUnusedLocals` does not flag because it is exported.

**One known unknown.** Step 4 of Task 7 needs an exact line range for a comment
in the `max-width: 639px` block of `globals.css`. The comment's closing sentence
is the anchor; if the line numbers have moved, match on the text
`Four labels at this size stay inside 320px.` rather than the numbers.
