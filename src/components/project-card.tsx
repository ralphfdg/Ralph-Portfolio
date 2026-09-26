import Image from "next/image";
import Link from "next/link";

import type { Project, ProjectStatus } from "@/lib/content/schema";

/**
 * Badge text and colour both come from `status`, so colour is never the only
 * signal. Amber is reserved for incomplete work and appears nowhere else.
 */
const statusMeta: Record<ProjectStatus, { label: string; className: string }> = {
  live: {
    label: "Live",
    className: "border-accent text-accent-bright",
  },
  repo: {
    label: "Source only",
    className: "border-accent text-accent-bright",
  },
  private: {
    label: "Private repo",
    className: "border-line text-muted",
  },
  wip: {
    label: "In development",
    className: "border-status-wip text-status-wip",
  },
};

export function ProjectCard({
  project,
  index,
  priority = false,
}: {
  project: Project;
  /** Two-digit ordinal shown above the title, e.g. "01". */
  index: string;
  /** Set on the first card, whose screenshot is the page's LCP element. */
  priority?: boolean;
}) {
  const status = statusMeta[project.status];

  return (
    <article className="group flex flex-col border border-line bg-surface transition-colors hover:border-accent">
      <div className="relative aspect-16/10 overflow-hidden border-b border-line bg-accent-deep">
        <Image
          src={project.screenshot.src}
          alt={project.screenshot.alt}
          fill
          priority={priority}
          sizes="(min-width: 768px) 40vw, 100vw"
          className="object-cover"
        />
        <span
          className={`absolute left-4 top-4 border bg-surface-2/90 px-2.5 py-1 font-mono text-[0.625rem] uppercase tracking-[0.12em] ${status.className}`}
        >
          {status.label}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-6">
        <span className="font-mono text-xs text-muted">{index}</span>
        <h3 className="type-display mt-2 text-xl text-fg">{project.title}</h3>
        <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">
          {project.hook}
        </p>

        <ul className="mt-5 flex flex-wrap gap-1.5" aria-label="Tech stack">
          {project.stack.map((item) => (
            <li
              key={item}
              className="border border-line px-2 py-0.5 font-mono text-[0.6875rem] text-muted"
            >
              {item}
            </li>
          ))}
        </ul>

        {/* Project links render only when there are any, so the card never
            ships a dead Live Demo or GitHub button. The case study always
            renders, because a detail page exists for every project. */}
        <div className="mt-6 flex flex-wrap items-center gap-4 border-t border-line pt-4">
          {project.links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="font-mono text-xs uppercase tracking-[0.12em] text-accent-bright underline-offset-4 hover:underline"
            >
              {link.label}
            </a>
          ))}
          <Link
            href={`/projects/${project.slug}`}
            className="ml-auto font-mono text-xs uppercase tracking-[0.12em] text-fg underline-offset-4 hover:text-accent-bright hover:underline"
          >
            Case study
          </Link>
        </div>
      </div>
    </article>
  );
}
