import { describe, expect, it } from "vitest";

import { projectSchema, projectsSchema, siteSchema } from "./schema";
import { projects } from "./projects";
import { skillMarks } from "./skill-marks";
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

  it("accepts a repo project with no links", () => {
    const result = projectSchema.safeParse({
      ...validProject,
      status: "repo",
      links: [],
    });
    expect(result.success).toBe(true);
  });

  it("rejects an unknown status", () => {
    const result = projectSchema.safeParse({
      ...validProject,
      status: "archived",
    });
    expect(result.success).toBe(false);
  });

  it("rejects a malformed site email", () => {
    const result = siteSchema.safeParse({ ...site, email: "not-an-email" });
    expect(result.success).toBe(false);
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

  it("rejects a non-positive screenshot aspect", () => {
    for (const aspect of [0, -1.6]) {
      const result = projectSchema.safeParse({
        ...validProject,
        screenshot: { src: "/projects/example.png", alt: "Example", aspect },
      });
      expect(result.success, `aspect ${aspect} should be rejected`).toBe(false);
    }
  });
});

describe("project screenshot ratios", () => {
  it("gives every project an aspect", () => {
    const missing = projects.filter((p) => !p.screenshot.aspect);
    expect(
      missing.map((p) => p.slug),
      "these will fall back to the 10/6 default and may crop",
    ).toEqual([]);
  });

  it("keeps every aspect plausible for a screenshot", () => {
    // A frame that matches its image exactly is the whole point of the field.
    // Anything outside this band is a sign the number was typed by hand rather
    // than measured, or that a portrait/infographic slipped in.
    for (const project of projects) {
      expect(
        project.screenshot.aspect,
        `${project.slug} aspect is out of range`,
      ).toBeGreaterThan(1);
      expect(
        project.screenshot.aspect,
        `${project.slug} aspect is out of range`,
      ).toBeLessThan(3);
    }
  });
});

describe("skill marks", () => {
  const everySkill = site.skills.flatMap((group) => group.items);

  it("has an explicit mark for every authored skill", () => {
    const missing = everySkill.filter(
      (skill) => !(skill in skillMarks),
    );
    expect(missing, `no mark authored for: ${missing.join(", ")}`).toEqual([]);
  });

  it("has no marks for skills that were removed", () => {
    const authored = new Set(everySkill);
    const orphaned = Object.keys(skillMarks).filter(
      (skill) => !authored.has(skill),
    );
    expect(orphaned, `marks for unknown skills: ${orphaned.join(", ")}`).toEqual(
      [],
    );
  });

  it("keeps the approved 23-skill set", () => {
    expect(
      everySkill,
      `expected 23 skills, got ${everySkill.length}`,
    ).toHaveLength(23);
  });

  it("has dropped the skills that have no brand mark", () => {
    const removed = ["SQL", "Azure Services"].filter((skill) =>
      everySkill.includes(skill),
    );
    expect(removed, `removed skills are back: ${removed.join(", ")}`).toEqual([]);
  });

  it("has no skill group left empty", () => {
    const empty = site.skills
      .filter((group) => group.items.length === 0)
      .map((group) => group.id);
    expect(empty, `empty groups: ${empty.join(", ")}`).toEqual([]);
  });

  it("gives every logo mark a non-empty alt", () => {
    const badAlt = Object.entries(skillMarks)
      .filter(([, mark]) => mark.kind === "logo" && !mark.alt)
      .map(([skill]) => skill);
    expect(badAlt, `logo marks missing alt: ${badAlt.join(", ")}`).toEqual([]);
  });
});
