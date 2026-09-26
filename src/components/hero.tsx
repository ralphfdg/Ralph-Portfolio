import { HeroMotion } from "./hero-motion";
import { site } from "@/lib/content/site";

export function Hero() {
  return (
    <div id="top" className="border-b border-line">
      <HeroMotion>
        <div className="mx-auto w-full max-w-5xl px-6 py-24 md:py-32">
          <p data-anim className="type-eyebrow text-accent">
            {site.title}
          </p>

          <h1
            data-anim
            className="type-display mt-5 text-5xl font-bold leading-[0.95] text-ink md:text-7xl"
          >
            {site.name}
          </h1>

          <p
            data-anim
            className="mt-6 max-w-xl text-lg leading-relaxed text-muted"
          >
            {site.hook}
          </p>

          <div data-anim className="mt-10 flex flex-wrap items-center gap-4">
            <a
              href="#work"
              className="rounded-full bg-accent px-6 py-3 font-mono text-xs uppercase tracking-[0.12em] text-paper transition-colors hover:bg-accent-strong"
            >
              View my work
            </a>
            <a
              href={site.resume.href}
              download={site.resume.filename}
              className="rounded-full border border-line px-6 py-3 font-mono text-xs uppercase tracking-[0.12em] text-ink transition-colors hover:border-accent hover:text-accent"
            >
              Download resume
            </a>
          </div>
        </div>
      </HeroMotion>
    </div>
  );
}
