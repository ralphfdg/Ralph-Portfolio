import type { InfiniteSpiralItem } from "./infinite-spiral";
import { Section } from "./section";
import { SkillSpiral } from "./skill-spiral";
import { getSkillMark } from "@/lib/content/skill-marks";
import { site } from "@/lib/content/site";

/**
 * One card per authored skill. Built here, on the server, so the client bundle
 * never has to carry the site config just to render a spiral.
 */
const spiralItems: InfiniteSpiralItem[] = site.skills
  .flatMap((group) => group.items)
  .map((name) => {
    const mark = getSkillMark(name);
    return mark.kind === "logo"
      ? { id: name, src: mark.src, alt: name }
      : { id: name, src: "", alt: name, text: mark.label };
  });

export function Skills() {
  return (
    <Section
      id="skills"
      index="02"
      eyebrow="Technical skills"
      title="My skills"
      lede="The tools I actually reach for, rather than an exhaustive list of everything I have opened once. The helix is this same list, turned."
    >
      {/* Equal columns: the list is the readable, selectable, no-JavaScript
          half and the spiral is the decorative one, so neither is asked to do
          the other's job. Below `md` they stack, list first. The row is left at
          the default `items-stretch` so the spiral frame can match the height of
          the list beside it rather than carrying a height of its own. */}
      <div className="mt-12 grid gap-10 md:grid-cols-2 md:gap-12">
        <div className="flex flex-col gap-8" data-reveal>
          {site.skills.map((group) => (
            <div key={group.id}>
              <h3 className="type-eyebrow border-b border-line pb-3 text-muted">
                {group.label}
              </h3>
              <ul className="mt-4 flex flex-wrap gap-1.5">
                {group.items.map((item) => (
                  <li
                    key={item}
                    className="border border-line px-2.5 py-1 font-mono text-xs text-fg"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div
          data-reveal
          className="h-full"
          style={{ "--reveal-delay": "120ms" } as React.CSSProperties}
        >
          <SkillSpiral items={spiralItems} />
        </div>
      </div>
    </Section>
  );
}
