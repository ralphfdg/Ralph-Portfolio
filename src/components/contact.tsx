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
      lede="Tell me what you are building and I will tell you honestly whether I can help. Email is the fastest way to reach me."
    >
      <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3" data-reveal>
        <a
          href={`mailto:${site.email}`}
          className="font-mono text-sm text-accent-bright underline-offset-4 transition-colors hover:text-accent-strong hover:underline"
        >
          {site.email}
        </a>
        {site.socials.map((social) => (
          <a
            key={social.href}
            href={social.href}
            className="font-mono text-xs uppercase tracking-[0.12em] text-muted underline-offset-4 transition-colors hover:text-accent-bright hover:underline"
          >
            {social.label}
          </a>
        ))}
      </div>
    </Section>
  );
}
