import type { Project } from "./schema";

/**
 * Every entry here is a stub until the real content is written.
 *
 * `featured: false` keeps them out of the home grid, so the grid renders its
 * empty state rather than three placeholder cards. Replace the title, hook,
 * summary, stack, status, and links for each one, then set `featured: true`
 * on the two that are ready.
 *
 * `status` is load-bearing: it drives the badge and which links render.
 *   live    -> badge "Live",             links required by the schema
 *   private -> badge "Private repo",     GitHub link only, and only if public
 *   wip     -> badge "In development",   no links
 */
export const projects: Project[] = [
  {
    slug: "healthcare-portal",
    title: "Multi-portal healthcare platform",
    status: "wip",
    hook:
      "Placeholder hook. Describe the problem this solved in one line, for example what the portals replaced and who used them.",
    summary:
      "Placeholder summary. One or two paragraphs on the problem, the approach, and the outcome. This same text renders on the card and at the top of the detail page.",
    stack: ["Next.js", "TypeScript", "Azure OpenAI", "Azure API Management"],
    screenshot: {
      src: "/projects/healthcare-portal.png",
      alt: "Placeholder alt text. Describe what the screenshot actually shows, not that it is a screenshot.",
    },
    links: [],
    featured: false,
    order: 0,
  },
  {
    slug: "fullstack-platform",
    title: "Full-stack web platform",
    status: "wip",
    hook:
      "Placeholder hook. One line on the outcome this platform produced for its users.",
    summary:
      "Placeholder summary. The problem, the approach, and what changed as a result. This project carries the longer write-up, so expect two paragraphs here and the detail slots below.",
    stack: ["React", "PostgreSQL", "Prisma", "TypeScript"],
    screenshot: {
      src: "/projects/fullstack-platform.png",
      alt: "Placeholder alt text. Describe the interface this project presents.",
    },
    links: [],
    featured: false,
    order: 1,
  },
  {
    slug: "in-development",
    title: "Project in development",
    status: "wip",
    hook:
      "Placeholder hook. One line on what this project will do and who it is for. Deliberately carries no date, since a public date goes stale.",
    summary:
      "Placeholder summary. Enough to show direction without overclaiming. A promise is not a project yet, so keep this short.",
    stack: ["Next.js", "TypeScript"],
    screenshot: {
      src: "/projects/in-development.png",
      alt: "Placeholder alt text for the work-in-progress screenshot.",
    },
    links: [],
    featured: false,
    order: 2,
  },
];

export function getProject(slug: string): Project | undefined {
  return projects.find((project) => project.slug === slug);
}

export function getFeaturedProjects(): Project[] {
  return projects
    .filter((project) => project.featured)
    .sort((a, b) => a.order - b.order);
}
