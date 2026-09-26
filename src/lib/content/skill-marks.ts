/**
 * Marks for the skills spiral, keyed by the exact skill strings in `site.ts`.
 *
 * A `logo` is a self-hosted SVG in `public/logos`, fetched once at build time
 * and coloured to match the mark's own brand palette rather than the page's text
 * colour. Self-hosting means no runtime CDN request and no trademark hotlinking.
 * A test in `logo-colors.test.ts` proves every fill clears 3:1 against the card
 * it is drawn on.
 *
 * A `monogram` is a letterform in the site's own mono face. Every authored skill
 * currently resolves to a `logo`, so nothing renders as a monogram today; the
 * kind is kept so a skill added later without a mark still produces a readable
 * card rather than a blank one.
 */
export type SkillMark =
  | { kind: "logo"; src: string; alt: string }
  | { kind: "monogram"; label: string };

export const skillMarks: Record<string, SkillMark> = {
  // Languages
  TypeScript: { kind: "logo", src: "/logos/typescript.svg", alt: "TypeScript" },
  JavaScript: { kind: "logo", src: "/logos/javascript.svg", alt: "JavaScript" },
  Python: { kind: "logo", src: "/logos/python.svg", alt: "Python" },
  Java: { kind: "logo", src: "/logos/java.svg", alt: "Java" },
  "C#": { kind: "logo", src: "/logos/csharp.svg", alt: "C#" },
  PHP: { kind: "logo", src: "/logos/php.svg", alt: "PHP" },
  HTML5: { kind: "logo", src: "/logos/html5.svg", alt: "HTML5" },
  CSS3: { kind: "logo", src: "/logos/css3.svg", alt: "CSS3" },

  // Frameworks and libraries
  "Next.js": { kind: "logo", src: "/logos/next.js.svg", alt: "Next.js" },
  React: { kind: "logo", src: "/logos/react.svg", alt: "React" },
  Laravel: { kind: "logo", src: "/logos/laravel.svg", alt: "Laravel" },
  Flutter: { kind: "logo", src: "/logos/flutter.svg", alt: "Flutter" },
  "Tailwind CSS": { kind: "logo", src: "/logos/tailwindcss.svg", alt: "Tailwind CSS" },
  "Express.js": { kind: "logo", src: "/logos/express.js.svg", alt: "Express.js" },

  // Backend and databases
  "Node.js": { kind: "logo", src: "/logos/node.js.svg", alt: "Node.js" },
  MySQL: { kind: "logo", src: "/logos/mysql.svg", alt: "MySQL" },
  PostgreSQL: { kind: "logo", src: "/logos/postgresql.svg", alt: "PostgreSQL" },
  SQLite: { kind: "logo", src: "/logos/sqlite.svg", alt: "SQLite" },

  // Tools and environments
  Docker: { kind: "logo", src: "/logos/docker.svg", alt: "Docker" },
  Git: { kind: "logo", src: "/logos/git.svg", alt: "Git" },
  GitHub: { kind: "logo", src: "/logos/github.svg", alt: "GitHub" },
  Postman: { kind: "logo", src: "/logos/postman.svg", alt: "Postman" },
  "Android Studio": { kind: "logo", src: "/logos/androidstudio.svg", alt: "Android Studio" },
};

/**
 * Falls back to a monogram so a newly authored skill renders a readable card
 * instead of a blank one. The schema test asserts every skill in `site.ts` has
 * an explicit entry, so the fallback is a safety net rather than the norm.
 */
export function getSkillMark(name: string): SkillMark {
  return skillMarks[name] ?? { kind: "monogram", label: name };
}
