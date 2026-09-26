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
