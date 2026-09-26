import { describe, expect, it } from "vitest";

import { projectSchema, projectsSchema, siteSchema } from "./schema";
import { projects } from "./projects";
import { site } from "./site";

const validProject = {
  slug: "example",
  title: "Example",
  status: "wip" as const,
  hook: "A hook",
  summary: "A summary",
  stack: ["Next.js"],
  screenshot: { src: "/projects/example.png", alt: "Screenshot" },
  links: [],
  featured: false,
  order: 0,
};

describe("content schema", () => {
  it("accepts every authored project", () => {
    const result = projectsSchema.safeParse(projects);
    expect(result.success, JSON.stringify(result.error?.issues, null, 2)).toBe(
      true,
    );
  });

  it("accepts the site config", () => {
    const result = siteSchema.safeParse(site);
    expect(result.success, JSON.stringify(result.error?.issues, null, 2)).toBe(
      true,
    );
  });

  it("rejects a live project with no links", () => {
    const result = projectSchema.safeParse({
      ...validProject,
      status: "live",
      links: [],
    });
    expect(result.success).toBe(false);
  });

  it("accepts a live project with a link", () => {
    const result = projectSchema.safeParse({
      ...validProject,
      status: "live",
      links: [{ label: "Live Demo", href: "https://example.com" }],
    });
    expect(result.success).toBe(true);
  });

  it("rejects a duplicate slug", () => {
    const result = projectsSchema.safeParse([
      validProject,
      { ...validProject, order: 1 },
    ]);
    expect(result.success).toBe(false);
  });

  it("rejects a duplicate order", () => {
    const result = projectsSchema.safeParse([
      validProject,
      { ...validProject, slug: "other" },
    ]);
    expect(result.success).toBe(false);
  });

  it("rejects a slug outside lowercase-dash format", () => {
    const result = projectSchema.safeParse({ ...validProject, slug: "Not A Slug" });
    expect(result.success).toBe(false);
  });

  it("rejects an empty stack", () => {
    const result = projectSchema.safeParse({ ...validProject, stack: [] });
    expect(result.success).toBe(false);
  });

  it("rejects a malformed link href", () => {
    const result = projectSchema.safeParse({
      ...validProject,
      links: [{ label: "Repo", href: "not-a-url" }],
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty screenshot alt text", () => {
    const result = projectSchema.safeParse({
      ...validProject,
      screenshot: { src: "/projects/example.png", alt: "" },
    });
    expect(result.success).toBe(false);
  });
});
