import { Section } from "./section";
import { site } from "@/lib/content/site";

/**
 * The contact form is deferred to a later pass, so this renders an honest
 * placeholder rather than a dead form. It exists so the nav's `#contact`
 * anchor and the Work section's fallback link both resolve to something real.
 */
export function Contact() {
  const hasSocials = site.socials.length > 0;

  return (
    <Section id="contact" eyebrow="Contact" title="Get in touch">
      <p className="mt-6 max-w-xl leading-relaxed text-muted">
        The contact form is the next piece of work, so this is the right place to
        leave a placeholder. Everything else on this site is wired up and
        verifiable.
      </p>

      {hasSocials ? (
        <div className="mt-8 flex flex-wrap items-center gap-5">
          {site.socials.map((social) => (
            <a
              key={social.href}
              href={social.href}
              className="font-mono text-xs uppercase tracking-[0.12em] text-accent underline-offset-4 hover:underline"
            >
              {social.label}
            </a>
          ))}
        </div>
      ) : (
        <p className="mt-8 font-mono text-xs text-muted">
          Email and social links are still to be confirmed.
        </p>
      )}
    </Section>
  );
}
