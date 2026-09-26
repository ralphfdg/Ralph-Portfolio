import Image from "next/image";

import { DotGrid } from "./dot-grid";
import { Section } from "./section";
import { site } from "@/lib/content/site";

/**
 * The contact form is deferred to a later pass, so this renders a working
 * `mailto:` rather than a form that cannot submit anything. It exists so the
 * nav's `#contact` anchor and the Work section's fallback link both resolve
 * to something real.
 *
 * Laid out as a centred block: the portrait and the actions form one centred
 * unit inside the normal reading column, so the section closes the page on the
 * same measure everything above it uses. The earlier version ran the portrait
 * full-bleed to the left edge, which put this section on a different grid from
 * the two above it.
 *
 * The dot lattice and the gradient blobs live here rather than in the hero,
 * which is a single shader: stacking a lattice, a band and three drifting blobs
 * on top of it was the most expensive thing on the page. The aurora band that
 * used to sit here has moved to the About section, so this backdrop is now two
 * layers rather than three.
 */
export function Contact() {
  return (
    <Section
      id="contact"
      index="04"
      eyebrow="Contact me"
      title="Let's make magic together!"
      lede="Tell me what you are building and I will work my magic! Email is the fastest way to reach me."
      onField
      backdrop={
        <>
          <div className="contact-glows">
            <span className="contact-blob contact-blob--a" />
            <span className="contact-blob contact-blob--b" />
            <span className="contact-blob contact-blob--c" />
          </div>

          {/* Above the blobs, not below: they are soft translucent gradients, so
              anything underneath them loses contrast, and these dots brighten
              on pointer proximity. `DotGrid` is already `absolute inset-0`, so
              the backdrop wrapper is the box it measures against. */}
          <DotGrid
            dotSize={5}
            gap={18}
            baseColor="#2A3350"
            activeColor="#9DB4E3"
            proximity={140}
          />
        </>
      }
    >
      <div
        className="mt-14 grid items-center gap-12 md:grid-cols-[minmax(0,360px)_minmax(0,1fr)] md:gap-16"
        data-reveal
      >
        {/* `aspect-[6/7]` rather than the `min-h` this had before: the source
            portrait is 1716x1748, so a fixed ratio crops the same slice the old
            360x420 box did, but it now stays true when the column is narrower
            than 360px instead of the image growing to fill whatever height the
            row happens to take. */}
        <div className="relative mx-auto aspect-[6/7] w-full max-w-[360px] overflow-hidden rounded-3xl bg-surface-2">
          <Image
            src={site.avatar.src}
            alt={site.avatar.alt}
            fill
            loading="lazy"
            sizes="(min-width: 768px) 360px, 90vw"
            className="object-cover"
          />
        </div>

        {/* `items-center text-center` centres the actions inside their own column
            on wide screens, and on a narrow one it falls back to the same
            centred stack below the portrait. The portrait is a fixed 360px
            rather than a fraction of the row, so the actions keep a consistent
            measure instead of spreading to fill whatever is left. */}
        <div className="flex flex-col items-center gap-8 text-center">
          {/* `break-all` is a safety net, not the intended layout. Michroma is a
              wide face and the address is 21 characters: at 20px it does not fit
              a 320px screen and `break-all` would split it mid-address, so the
              base size is 18px, which does fit on one line. The `md` step has
              room for 24px. */}
          <a
            href={`mailto:${site.email}`}
            className="type-display break-all text-lg text-fg underline-offset-[6px] transition-colors hover:text-ember-bright hover:underline md:text-2xl"
          >
            {site.email}
          </a>

          {/* `max-w-md` because the portrait column is fixed, which leaves the
              actions roughly 1080px to fill at 1440. Left uncapped the three
              tiles spread to a third of the screen each and stop reading as a
              set; `mx-auto` pulls the capped row back to the centre.

              Filled rather than outlined: these are the last actionable things on
              the page, and they were the least visible thing on it. Outlined
              blue on a dark field measured 4.68:1 and read as background. */}
          <ul className="mx-auto grid w-full max-w-md gap-3 sm:grid-cols-3">
            {site.socials.map((social) => (
              <li key={social.href}>
                <a
                  href={social.href}
                  className="block bg-ember px-4 py-3 text-center font-mono text-xs uppercase tracking-[0.12em] text-bg transition-colors hover:bg-ember-bright"
                >
                  {social.label}
                </a>
              </li>
            ))}
            {/* Also linked from the hero. Repeated deliberately: a resume is a
                closing-section action, and the hero link is a small pill. */}
            <li>
              <a
                href={site.resume.href}
                download={site.resume.filename}
                className="block bg-ember px-4 py-3 text-center font-mono text-xs uppercase tracking-[0.12em] text-bg transition-colors hover:bg-ember-bright"
              >
                Résumé
              </a>
            </li>
          </ul>
        </div>
      </div>
    </Section>
  );
}
