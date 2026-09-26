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
    <Section id="contact" eyebrow="Contact" title="Get in touch">
      <p className="mt-6 max-w-xl leading-relaxed text-muted">
        The contact form is the next piece of work. Until it lands, email is the
        fastest way to reach me.
      </p>

      <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
        <a
          href={`mailto:${site.email}`}
          className="font-mono text-sm text-accent underline-offset-4 hover:underline"
        >
          {site.email}
        </a>
        {site.socials.map((social) => (
          <a
            key={social.href}
            href={social.href}
            className="font-mono text-xs uppercase tracking-[0.12em] text-muted underline-offset-4 hover:text-accent hover:underline"
          >
            {social.label}
          </a>
        ))}
      </div>
    </Section>
  );
}
