import { z } from "zod";

/**
 *   live    -> deployed and publicly reachable, so a live URL is required
 *   repo    -> finished and readable as source, but never deployed
 *   private -> the code is not public either
 *   wip     -> still being built
 */
export const projectStatusSchema = z.enum(["live", "repo", "private", "wip"]);

export const projectLinkSchema = z.object({
  label: z.string().min(1),
  href: z.url(),
});

export const decisionSchema = z.object({
  heading: z.string().min(1),
  body: z.string().min(1),
});

export const projectSchema = z
  .object({
    slug: z.string().regex(/^[a-z0-9-]+$/, {
      error: "Slug must be lowercase letters, digits, and dashes",
    }),
    title: z.string().min(1),
    status: projectStatusSchema,
    hook: z.string().min(1),
    summary: z.string().min(1),
    stack: z.array(z.string().min(1)).min(1),
    screenshot: z.object({
      src: z.string().min(1),
      alt: z.string().min(1),
      /**
       * width / height of the source image, so the frame that holds it can
       * match instead of cropping. Optional: a project that omits it falls back
       * to the default ratio in `.shot-frame`, which is a letterboxed-crop risk
       * only if its screenshot is not roughly that shape.
       */
      aspect: z.number().positive().optional(),
    }),
    links: z.array(projectLinkSchema),
    featured: z.boolean(),
    order: z.number().int().nonnegative(),
    problem: z.string().optional(),
    role: z.string().optional(),
    architecture: z.string().optional(),
    decisions: z.array(decisionSchema).optional(),
    lessons: z.string().optional(),
  })
  .superRefine((project, ctx) => {
    if (project.status === "live" && project.links.length === 0) {
      ctx.addIssue({
        code: "custom",
        path: ["links"],
        message: "A live project needs at least one link",
      });
    }
  });

export const projectsSchema = z
  .array(projectSchema)
  .superRefine((list, ctx) => {
    const slugs = new Set(list.map((project) => project.slug));
    const orders = new Set(list.map((project) => project.order));

    if (slugs.size !== list.length) {
      ctx.addIssue({
        code: "custom",
        path: [],
        message: "Project slugs must be unique",
      });
    }

    if (orders.size !== list.length) {
      ctx.addIssue({
        code: "custom",
        path: [],
        message: "Project order values must be unique",
      });
    }
  });

export const skillGroupSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  items: z.array(z.string().min(1)).min(1),
});

export const socialLinkSchema = z.object({
  label: z.string().min(1),
  href: z.url(),
});

export const aboutSchema = z.object({
  heading: z.string().min(1),
  /**
   * An array even though the approved copy is a single paragraph, so the copy
   * can be split later without a schema or type change.
   *
   * The 400 cap is measured rather than guessed: the approved copy is 360
   * characters. It lives in the schema rather than only in a test so the limit
   * is enforced when the content is parsed.
   */
  paragraphs: z.array(z.string().min(1).max(400)).min(1),
  /** Plain text, not links: a hobby is not a destination. */
  interests: z.array(z.string().min(1)).default([]),
});

export const siteSchema = z.object({
  name: z.string().min(1),
  title: z.string().min(1),
  hook: z.string().min(1),
  email: z.email(),
  avatar: z.object({
    src: z.string().min(1),
    alt: z.string().min(1),
  }),
  resume: z.object({
    href: z.string().min(1),
    filename: z.string().min(1),
  }),
  socials: z.array(socialLinkSchema),
  skills: z.array(skillGroupSchema).min(1),
  about: aboutSchema,
});

export type ProjectStatus = z.infer<typeof projectStatusSchema>;
export type ProjectLink = z.infer<typeof projectLinkSchema>;
export type Decision = z.infer<typeof decisionSchema>;
export type Project = z.infer<typeof projectSchema>;
export type SkillGroup = z.infer<typeof skillGroupSchema>;
export type SocialLink = z.infer<typeof socialLinkSchema>;
export type About = z.infer<typeof aboutSchema>;
export type SiteConfig = z.infer<typeof siteSchema>;
