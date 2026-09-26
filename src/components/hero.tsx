import Grainient from "./grainient";
import { site } from "@/lib/content/site";

export function Hero() {
  return (
    // `min-h-svh` rather than `min-h-screen` or `min-h-dvh`. `svh` is the
    // smallest viewport, so the hero always covers a full screen and mobile
    // browser chrome can never crop it; `dvh` would resize as that chrome
    // hides, shifting the whole page under the reader mid-scroll.
    //
    // `bg-bg` is not decoration any more. It is what the section falls back to
    // when the shader cannot run — no WebGL, or a WebGL 1 context, which
    // `grainient.tsx` refuses rather than rendering an empty box.
    <div id="top" className="relative flex min-h-svh flex-col overflow-hidden bg-bg">
      {/* The hero's whole background is one shader. It replaced the static
          `.hero-gradient` wash, the three drifting glow blobs, the dot lattice
          and the aurora band that used to stack here; the dot grid and the
          aurora now live in the contact section instead.

          The copy below is unambiguously above it, and the hero text stays real
          DOM text: selectable, and readable without canvas support. */}
      <div aria-hidden className="absolute inset-0">
        <Grainient />
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

        {/* `muted-bright`, not `muted`: this line sits on the Grainient field,
            and the contrast maths behind that is in grainient.tsx. */}
        <p className="rise-in rise-in-3 mt-6 max-w-xl text-lg leading-relaxed text-muted-bright">
          {site.hook}
        </p>

          {/* The two pills are the only rounded shapes in the hero, kept as a
              deliberate organic note against the shader's soft field.

              Amber rather than the brand blue: blue is this site's `actionable`
              colour, so a blue button was the same colour as every link and
              eyebrow around it and sank into the shader. The measured ratios are
              in `globals.css`. */}
        <div className="rise-in rise-in-4 mt-10 flex flex-wrap items-center justify-center gap-4">
          <a
            href="#work"
            className="rounded-full bg-ember px-6 py-3 font-mono text-xs uppercase tracking-[0.12em] text-bg transition-colors hover:bg-ember-bright"
          >
            View my work
          </a>
          <a
            href={site.resume.href}
            download={site.resume.filename}
            className="rounded-full border border-ember px-6 py-3 font-mono text-xs uppercase tracking-[0.12em] text-ember-bright transition-colors hover:border-ember-bright"
          >
            Download resume
          </a>
        </div>
      </div>
    </div>
  );
}
