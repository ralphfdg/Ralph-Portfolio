import { site } from "@/lib/content/site";

const links = [
  { href: "#work", label: "Work" },
  { href: "#skills", label: "Skills" },
  { href: "#contact", label: "Contact" },
];

export function Nav() {
  return (
    <header className="sticky top-0 z-50 border-b border-line bg-paper/85 backdrop-blur-sm">
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-6 px-6 py-4">
        <a
          href="#top"
          className="type-display text-base font-bold tracking-tight text-ink"
        >
          {site.name}
        </a>

        <nav aria-label="Sections">
          <ul className="flex items-center gap-5">
            {links.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className="font-mono text-xs uppercase tracking-[0.12em] text-muted transition-colors hover:text-accent"
                >
                  {link.label}
                </a>
              </li>
            ))}
            {site.socials.map((social) => (
              <li key={social.href}>
                <a
                  href={social.href}
                  className="font-mono text-xs uppercase tracking-[0.12em] text-muted transition-colors hover:text-accent"
                >
                  {social.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}
