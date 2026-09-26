import Image from "next/image";
import { DotGrid } from "./dot-grid";
import { site } from "@/lib/content/site";

export function Hero() {
  return (
    <div id="top" className="relative overflow-hidden border-b border-line bg-bg">
      {/* The lattice is decorative and sits behind the copy, so the hero text
          stays real DOM text: selectable, and readable without canvas support.
          The hero also paints its own opaque background, which is what keeps the
          page-wide CursorGrid behind it out of this section. */}
      <DotGrid
        dotSize={3}
        gap={24}
        baseColor="#2A3350"
        activeColor="#9DB4E3"
        proximity={120}
      />

      <div className="relative mx-auto w-full max-w-5xl px-6 py-24 md:py-32">
        <div className="grid items-center gap-12 md:grid-cols-[1fr_auto]">
          <div>
            <p className="type-eyebrow text-accent-bright">{site.title}</p>

            <h1 className="type-display mt-5 text-5xl leading-[0.95] text-fg md:text-7xl">
              {site.name}
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted">
              {site.hook}
            </p>

            {/* The two pills are the only rounded shapes on the site, kept as a
                deliberate organic note against the lattice and square cells. */}
            <div className="mt-10 flex flex-wrap items-center gap-4">
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

          {/* Square corners and full colour are deliberate: the portrait is the
              one photographic element in an otherwise geometric page. */}
          <div className="md:justify-self-end">
            <Image
              src="/images/Formal-Picture - Ralph.jpg"
              alt={`${site.name}, software engineer`}
              width={1716}
              height={1748}
              priority
              sizes="(min-width: 768px) 256px, 176px"
              className="h-auto w-44 border border-line object-cover sm:w-56 md:w-64"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
