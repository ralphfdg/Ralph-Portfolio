import { Section } from "./section";
import { site } from "@/lib/content/site";

export function Skills() {
  return (
    <Section id="skills" index="02" eyebrow="Technical skills" title="Stack">
      <div className="mt-12 grid gap-x-10 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
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
    </Section>
  );
}
