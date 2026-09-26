import { ProjectCard } from "./project-card";
import { Section } from "./section";
import { getFeaturedProjects } from "@/lib/content/projects";

export function Projects() {
  const featured = getFeaturedProjects();

  return (
    <Section
      id="work"
      index="02"
      eyebrow="Selected work"
      title="My work"
      lede="Here are some of my projects."
    >
      {featured.length === 0 ? (
        <div className="mt-10 border border-dashed border-line p-10">
          <p className="max-w-md text-sm leading-relaxed text-muted">
            Case studies are being written. In the meantime, the skills below and
            the contact details are the fastest way to see how I work.
          </p>
          <a
            href="#contact"
            className="mt-5 inline-block font-mono text-xs uppercase tracking-[0.12em] text-accent-bright underline-offset-4 hover:underline"
          >
            Get in touch instead
          </a>
        </div>
      ) : (
        <div className="mt-12 grid gap-6 md:grid-cols-2" data-reveal>
          {featured.map((project, index) => (
            <ProjectCard
              key={project.slug}
              project={project}
              index={String(index + 1).padStart(2, "0")}
              priority={index === 0}
              variant={index === 0 ? "feature" : "standard"}
            />
          ))}
        </div>
      )}
    </Section>
  );
}
