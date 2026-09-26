import { DotGrid } from "./dot-grid";
import SoftAurora from "./soft-aurora";
import { site } from "@/lib/content/site";

export function Hero() {
  return (
    <div id="top" className="relative overflow-hidden bg-bg">
      {/* Every decorative layer sits in one absolutely positioned wrapper, so
          the copy below is unambiguously above all of them and cannot be
          overlapped by a canvas that happens to be taller than expected. The
          lattice is decorative and the hero text stays real DOM text:
          selectable, and readable without canvas support. */}
      <div aria-hidden className="absolute inset-0">
        <div className="hero-gradient absolute inset-0" />
        <div className="hero-glows">
          <span className="hero-glow hero-glow--a" />
          <span className="hero-glow hero-glow--b" />
          <span className="hero-glow hero-glow--c" />
        </div>
        <DotGrid
          dotSize={3}
          gap={24}
          baseColor="#2A3350"
          activeColor="#9DB4E3"
          proximity={120}
        />
        {/* Replaces the hero's old border-b. Masked at the top edge so the
            canvas box has no seam. */}
        <div className="hero-aurora absolute inset-x-0 bottom-0 h-[150px]">
          <SoftAurora color1="#9db4e3" color2="#4d6fd1" />
        </div>
      </div>

      <div className="relative mx-auto flex w-full max-w-3xl flex-col items-center px-6 py-28 text-center md:py-36">
        <p className="type-eyebrow rise-in rise-in-1 text-accent-bright">
          {site.title}
        </p>

        <h1 className="type-display rise-in rise-in-2 mt-5 text-5xl leading-[0.95] text-fg md:text-7xl">
          {site.name}
        </h1>

        <p className="rise-in rise-in-3 mt-6 max-w-xl text-lg leading-relaxed text-muted">
          {site.hook}
        </p>

        {/* The two pills are the only rounded shapes on the site, kept as a
            deliberate organic note against the lattice and square cells. */}
        <div className="rise-in rise-in-4 mt-10 flex flex-wrap items-center justify-center gap-4">
          <a
            href="#work"
            className="rounded-full bg-accent px-6 py-3 font-mono text-xs uppercase tracking-[0.12em] text-bg transition-colors hover:bg-accent-strong"
          >
            View my work
          </a>
          <a
            href={site.resume.href}
            download={site.resume.filename}
            className="rounded-full border border-line px-6 py-3 font-mono text-xs uppercase tracking-[0.12em] text-fg transition-colors hover:border-accent hover:text-accent-bright"
          >
            Download resume
          </a>
        </div>
      </div>
    </div>
  );
}
