import { site } from "@/lib/content/site";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative z-10 mt-auto border-t border-line bg-bg">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-3 px-6 py-8 sm:flex-row sm:items-center sm:justify-between">
        <p className="font-mono text-xs text-muted">
          {year} {site.name}
        </p>
        <ul className="flex flex-wrap items-center gap-5">
          {site.socials.map((social) => (
            <li key={social.href}>
              <a
                href={social.href}
                className="font-mono text-xs uppercase tracking-[0.12em] text-muted underline-offset-4 transition-colors hover:text-accent-bright hover:underline"
              >
                {social.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </footer>
  );
}
