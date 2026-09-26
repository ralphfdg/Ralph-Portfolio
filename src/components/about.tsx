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
      index="01"
      eyebrow="About me"
      title={site.about.heading}
      midSlot={
        /* `brightness` is the shader's own multiplier, and the fragment shader
           feeds `clamp(length(col))` into alpha — so at 0.5 this band rendered
           at half opacity and read as a faint tint rather than an aurora. It is
           at the component default of 1.0 now.

           The mask is what protects the copy, not the brightness: it feathers
           the band's outer 30% at each end, and the spacer is the gap between
           the heading and the body, so the bright core sits in empty space with
           the two blocks of text outside the falloff. That is why this can be
           turned up without measuring contrast again for every step.

           `bandHeight` is raised from the 0.5 default because the solid region
           the mask leaves is only the middle 40% of the 120px spacer — 48px.
           At 0.5 the band is 60px tall and is cropped at both ends by the very
           mask meant to soften it. 0.7 fills what the mask actually reveals. */
        <div className="aurora-band">
          <SoftAurora
            color1="#9ec4ff"
            color2="#4169e1"
            brightness={1.0}
            bandHeight={0.7}
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
