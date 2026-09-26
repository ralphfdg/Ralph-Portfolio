import type { SiteConfig } from "./schema";

export const site: SiteConfig = {
  name: "Ethan",
  title: "Software Engineer",
  hook: "Full-stack engineer building Laravel, TypeScript, and AWS systems, from AI-assisted clinical tooling to property management.",

  email: "ralphethan18@gmail.com",

  avatar: {
    src: "/avatar.jpg",
    alt: "Portrait of Ethan",
  },

  resume: {
    href: "/resume.pdf",
    filename: "Ethan-De-Guzman-Resume.pdf",
  },

  socials: [
    { label: "GitHub", href: "https://github.com/ralphfdg" },
    {
      label: "LinkedIn",
      href: "https://linkedin.com/in/ralph-de-guzman-161725314",
    },
  ],

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
      items: ["AWS", "Azure Services"],
    },
    {
      id: "tools",
      label: "Tools & Environments",
      items: ["Docker", "Git", "GitHub", "Postman", "Android Studio"],
    },
  ],
};
