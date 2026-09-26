import Image from "next/image";

import { Section } from "./section";
import { site } from "@/lib/content/site";

/**
 * The contact form is deferred to a later pass, so this renders a working
 * `mailto:` rather than a form that cannot submit anything. It exists so the
 * nav's `#contact` anchor and the Work section's fallback link both resolve
 * to something real.
 *
 * Laid out as a split rather than a centred block: the portrait takes the whole
 * left edge at full height and the actions stack opposite it, so the section
 * reads as a closing statement instead of another centred column.
 */
export function Contact() {
  return (
    <Section
      id="contact"
      index="03"
      eyebrow="Contact me"
      title="Let's make magic together!"
      tone="brand"
      layout="split"
      lede="Tell me what you are building and I will work my magic! Email is the fastest way to reach me."
    >
      <div
        className="grid md:grid-cols-[minmax(0,360px)_minmax(0,1fr)]"
        data-reveal
      >
        {/* Full-bleed to the left edge, so the frame carries no left padding
            and rounds only on the open side. Rounding the viewport-facing edge
            too would put a notch of background against the screen edge.

            The column is a fixed 360px rather than a fraction of the row. As a
            fraction it grew with the viewport and the portrait reached 634px on
            a 1440 screen, which read as a poster rather than a portrait; a fixed
            column keeps it a consistent size and hands the width to the
            actions. */}
        <div className="relative min-h-[280px] overflow-hidden rounded-b-3xl rounded-r-3xl bg-accent-deep md:min-h-[420px] md:rounded-br-none">
          <Image
            src={site.avatar.src}
            alt={site.avatar.alt}
            fill
            loading="lazy"
            sizes="(min-width: 768px) 42vw, 100vw"
            className="object-cover"
          />
        </div>

        {/* `max-w-2xl` because the portrait column is fixed now, which leaves the
            actions roughly 1080px to fill at 1440. Left uncapped the three tiles
            spread to a third of the screen each and stop reading as a set. */}
        <div className="flex max-w-2xl flex-col justify-center gap-8 px-6 py-14 md:px-10 md:py-16 lg:px-14">
          {/* `break-all` is a safety net, not the intended layout. Michroma is a
              wide face and the address is 21 characters: at 20px it does not fit
              a 320px screen and `break-all` would split it mid-address, so the
              base size is 18px, which does fit on one line. The `md` step has
              room for 24px. */}
          <a
            href={`mailto:${site.email}`}
            className="type-display break-all text-lg text-fg underline-offset-[6px] transition-colors hover:text-accent-bright hover:underline md:text-2xl"
          >
            {site.email}
          </a>

          <ul className="grid gap-3 sm:grid-cols-3">
            {site.socials.map((social) => (
              <li key={social.href}>
                <a
                  href={social.href}
                  className="block border border-accent/40 px-4 py-3 font-mono text-xs uppercase tracking-[0.12em] text-accent-bright transition-colors hover:border-accent-bright"
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
                className="block border border-accent/40 px-4 py-3 font-mono text-xs uppercase tracking-[0.12em] text-accent-bright transition-colors hover:border-accent-bright"
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
