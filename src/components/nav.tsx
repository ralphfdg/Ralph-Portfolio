import { GooeyNav } from "./gooey-nav";
import { site } from "@/lib/content/site";

export function Nav() {
  return (
    /* `backdrop-blur-sm` is gone: the GradualBlur in `layout.tsx` is anchored
       to the same top edge and does a graduated version of this job. Keeping
       both stacked two `backdrop-filter`s over the same pixels. */
    <header className="sticky top-0 z-50 border-b border-line bg-bg/80">
      {/* One centred group rather than wordmark / nav / socials spread across a
          justify-between row: the bar reads as a single unit, and the sticky
          header can never wrap onto a second line as the labels grow. */}
      <div className="mx-auto flex w-full max-w-5xl items-center justify-center px-6 py-4">
        <div className="flex items-center gap-6">
          {/* Always rendered: the goo treatment is dropped by CSS below `sm`
              rather than unmounted, so the section links stay reachable on
              phones and the page keeps a single nav landmark and filter id. */}
          <GooeyNav />

          {/* Socials repeat in the footer and the contact section, so they drop
              out of the bar on narrow screens rather than crowd the four
              section labels at 320px. */}
          <ul className="hidden items-center gap-5 md:flex">
            {site.socials.map((social) => (
              <li key={social.href}>
                <a
                  href={social.href}
                  className="font-mono text-xs uppercase tracking-[0.12em] text-muted transition-colors hover:text-accent-bright"
                >
                  {social.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </header>
  );
}
