import type { SiteConfig } from "./schema";

export const site: SiteConfig = {
  name: "Ralph Ethan De Guzman",
  title: "Software Engineer",
  hook: "Software engineer building full-stack web and cloud systems.",

  avatar: {
    src: "/avatar.jpg",
    alt: "Portrait of Ralph Ethan De Guzman",
  },

  resume: {
    href: "/resume.pdf",
    filename: "Ralph-Ethan-De-Guzman-Resume.pdf",
  },

  // Add entries as the URLs are confirmed. The nav and footer skip
  // rendering a link when its target is empty.
  socials: [],

  skills: [
    {
      id: "languages",
      label: "Languages",
      items: [
        "TypeScript",
        "JavaScript",
        "Python",
        "Java",
        "C#",
        "PHP",
        "SQL",
        "HTML5",
        "CSS3",
      ],
    },
    {
      id: "frameworks",
      label: "Frameworks & Libraries",
      items: [
        "Next.js",
        "React",
        "Laravel",
        "Flutter",
        "Tailwind CSS",
        "Express.js",
      ],
    },
    {
      id: "backend",
      label: "Backend & Databases",
      items: ["Node.js", "MySQL", "PostgreSQL", "SQLite"],
    },
    {
      id: "cloud",
      label: "Cloud & Platforms",
      items: ["Azure Services", "Firebase"],
    },
    {
      id: "tools",
      label: "Tools & Environments",
      items: ["Docker", "Git", "GitHub", "Postman", "Android Studio"],
    },
  ],
};
