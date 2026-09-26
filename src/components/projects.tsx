import { ProjectCard } from "./project-card";
import { Section } from "./section";
import { getFeaturedProjects } from "@/lib/content/projects";

export function Projects() {
  const featured = getFeaturedProjects();

  return (
    <Section id="work" eyebrow="Selected work" title="Projects">
      {featured.length === 0 ? (
        <div className="mt-10 border border-dashed border-line p-10">
          <p className="max-w-md text-sm leading-relaxed text-muted">
            Case studies are being written. In the meantime, the stack below and the
            contact form are the fastest way to see how I work.
          </p>
          <a
            href="#contact"
            className="mt-5 inline-block font-mono text-xs uppercase tracking-[0.12em] text-accent underline-offset-4 hover:underline"
          >
            Get in touch instead
          </a>
        </div>
      ) : (
        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {featured.map((project, index) => (
            <ProjectCard
              key={project.slug}
              project={project}
              priority={index === 0}
            />
          ))}
        </div>
      )}
    </Section>
  );
}
