import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Contact } from "@/components/contact";
import { getProject, projects } from "@/lib/content/projects";
import { site } from "@/lib/content/site";
import type { Project } from "@/lib/content/schema";

export function generateStaticParams() {
  return projects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/projects/[slug]">) {
  const { slug } = await params;
  const project = getProject(slug);

  if (!project) {
    return { title: "Project not found" };
  }

  return {
    title: `${project.title} · ${site.name}`,
    description: project.hook,
  };
}

/** A labelled prose block. Returns null when the author left it empty, so no
 *  orphaned heading survives. */
function Block({
  heading,
  children,
}: {
  heading: string;
  children?: string;
}) {
  if (!children) return null;

  return (
    <div className="mt-10">
      <h2 className="type-eyebrow border-b border-line pb-3 text-accent">
        {heading}
      </h2>
      <p className="mt-4 max-w-2xl leading-relaxed text-ink">{children}</p>
    </div>
  );
}

function ProjectDetail({ project }: { project: Project }) {
  return (
    <article>
      <header className="border-b border-line">
        <div className="mx-auto w-full max-w-5xl px-6 py-16 md:py-20">
          <Link
            href="/#work"
            className="font-mono text-xs uppercase tracking-[0.12em] text-muted underline-offset-4 hover:text-accent hover:underline"
          >
            Back to work
          </Link>

          <h1 className="type-display mt-6 text-4xl font-bold leading-tight text-ink md:text-5xl">
            {project.title}
          </h1>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted">
            {project.hook}
          </p>

          <ul className="mt-8 flex flex-wrap gap-1.5" aria-label="Tech stack">
            {project.stack.map((item) => (
              <li
                key={item}
                className="border border-line px-2.5 py-1 font-mono text-xs text-ink"
              >
                {item}
              </li>
            ))}
          </ul>

          {project.links.length > 0 && (
            <div className="mt-8 flex flex-wrap items-center gap-5">
              {project.links.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="font-mono text-xs uppercase tracking-[0.12em] text-accent underline-offset-4 hover:underline"
                >
                  {link.label}
                </a>
              ))}
            </div>
          )}
        </div>
      </header>

      <div className="mx-auto w-full max-w-5xl px-6 py-14">
        <div className="relative aspect-16/9 overflow-hidden border border-line bg-accent-tint">
          <Image
            src={project.screenshot.src}
            alt={project.screenshot.alt}
            fill
            priority
            sizes="(min-width: 1024px) 64rem, 100vw"
            className="object-cover"
          />
        </div>

        <div className="mt-12 max-w-2xl">
          <p className="text-base leading-relaxed text-ink">{project.summary}</p>
        </div>

        <Block heading="The problem">{project.problem}</Block>
        <Block heading="My role">{project.role}</Block>
        <Block heading="Architecture">{project.architecture}</Block>

        {project.decisions && project.decisions.length > 0 && (
          <div className="mt-10">
            <h2 className="type-eyebrow border-b border-line pb-3 text-accent">
              Key decisions
            </h2>
            <dl className="mt-6 space-y-6">
              {project.decisions.map((decision) => (
                <div key={decision.heading}>
                  <dt className="type-display text-lg font-bold text-ink">
                    {decision.heading}
                  </dt>
                  <dd className="mt-2 max-w-2xl leading-relaxed text-muted">
                    {decision.body}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        )}

        <Block heading="What I would do differently">{project.lessons}</Block>
      </div>
    </article>
  );
}

export default async function ProjectPage({ params }: PageProps<"/projects/[slug]">) {
  const { slug } = await params;
  const project = getProject(slug);

  if (!project) {
    notFound();
  }

  return (
    <>
      <ProjectDetail project={project} />
      <Contact />
    </>
  );
}
