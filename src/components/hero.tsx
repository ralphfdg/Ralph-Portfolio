import { DotGrid } from "./dot-grid";
import SoftAurora from "./soft-aurora";
import { site } from "@/lib/content/site";

export function Hero() {
  return (
    // `min-h-svh` rather than `min-h-screen` or `min-h-dvh`. `svh` is the
    // smallest viewport, so the hero always covers a full screen and mobile
    // browser chrome can never crop it; `dvh` would resize as that chrome
    // hides, shifting the whole page under the reader mid-scroll. This is also
    // the parallax scope, so the layers travel across the hero's own height.
    <div id="top" data-parallax-scope className="relative flex min-h-svh flex-col overflow-hidden bg-bg">
      {/* Every decorative layer sits in one absolutely positioned wrapper, so
          the copy below is unambiguously above all of them and cannot be
          overlapped by a canvas that happens to be taller than expected. The
          lattice is decorative and the hero text stays real DOM text:
          selectable, and readable without canvas support.

          The `data-parallax` rates hand each layer a different depth. They are on
          the wrappers, not the `.hero-glow` spans, because those spans run
          infinite CSS keyframes that would outrank an inline transform. */}
      <div aria-hidden className="absolute inset-0">
        <div className="hero-gradient absolute inset-0" data-parallax="6" />
        <div className="hero-glows" data-parallax="16">
          <span className="hero-glow hero-glow--a" />
          <span className="hero-glow hero-glow--b" />
          <span className="hero-glow hero-glow--c" />
        </div>
        <div className="absolute inset-0" data-parallax="10">
          <DotGrid
            dotSize={5}
            gap={18}
            baseColor="#2A3350"
            activeColor="#9DB4E3"
            proximity={140}
          />
        </div>
        {/* Replaces the hero's old border-b. Masked at the top edge so the
            canvas box has no seam. */}
        <div className="hero-aurora absolute inset-x-0 bottom-0 h-[150px]" data-parallax="26">
          <SoftAurora color1="#9db4e3" color2="#4d6fd1" />
        </div>
      </div>

      {/* `flex-1` plus the centering is what makes the hero a full screen: the
          wrapper reserves the viewport height and the copy takes the middle of
          whatever is left, instead of the copy's own height deciding the
          section's height and leaving a short band above the fold. The `py` is
          a floor for short viewports, not the main spacing. */}
      <div className="relative mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center px-6 py-20 text-center md:py-28">
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
