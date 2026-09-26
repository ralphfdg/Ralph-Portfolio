import Image from "next/image";

import { Section } from "./section";
import { site } from "@/lib/content/site";

/**
 * The contact form is deferred to a later pass, so this renders a working
 * `mailto:` rather than a form that cannot submit anything. It exists so the
 * nav's `#contact` anchor and the Work section's fallback link both resolve
 * to something real.
 */
export function Contact() {
  return (
    <Section
      id="contact"
      index="03"
      eyebrow="Contact me"
      title="Let's make magic together!"
      tone="brand"
      lede="Tell me what you are building and I will work my magic! Email is the fastest way to reach me."
    >
      <div
        className="mt-10 flex flex-col gap-8 sm:flex-row sm:items-center sm:gap-10"
        data-reveal
      >
        {/* The parent carries the size because the image fills it; `fill` with
            no intrinsic dimensions would collapse to zero. */}
        <div className="relative h-64 w-64 shrink-0 overflow-hidden rounded-3xl border border-accent/40 sm:h-72 sm:w-72">
          <Image
            src="/images/Formal-Picture - Ralph.jpg"
            alt="Ethan, a software engineer"
            fill
            loading="lazy"
            sizes="(min-width: 640px) 288px, 256px"
            className="object-cover"
          />
        </div>

        <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
          <a
            href={`mailto:${site.email}`}
            className="font-mono text-sm text-accent-bright underline-offset-4 transition-colors hover:text-fg hover:underline"
          >
            {site.email}
          </a>
          {site.socials.map((social) => (
            <a
              key={social.href}
              href={social.href}
              className="font-mono text-xs uppercase tracking-[0.12em] text-accent-bright underline-offset-4 transition-colors hover:text-fg hover:underline"
            >
              {social.label}
            </a>
          ))}
        </div>
      </div>
    </Section>
  );
}
