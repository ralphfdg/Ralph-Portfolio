export function Section({
  id,
  index,
  eyebrow,
  title,
  lede,
  backdrop,
  midSlot,
  onField = false,
  children,
}: {
  id: string;
  /** Two-digit ordinal shown against the eyebrow, e.g. "02". */
  index: string;
  eyebrow: string;
  title: string;
  /** Optional supporting line, rendered under the title. */
  lede?: string;
  /**
   * Decorative background layers, rendered inside the section but *outside* the
   * reading column so they can run to the section's edges. `Contact` uses this
   * for the dot lattice, the aurora band and the gradient blobs.
   *
   * The wrapper is `aria-hidden` and pointer-transparent, so nothing in here
   * reaches the accessibility tree or intercepts clicks on the content above.
   * It also clips: the layers inside it deliberately hang off the section's
   * edges, and clipping here rather than on the section keeps the section from
   * becoming a scroll container, which would break `position: sticky` for
   * anything nested inside it.
   */
  backdrop?: React.ReactNode;
  /**
   * A decorative layer rendered in the gap between the header and the body, in a
   * full-width spacer. Unlike `backdrop` it is *not* clipped to the section and
   * is positioned in normal flow, so a layer placed here can run to the
   * section's edges. `About` uses it for the soft aurora band.
   *
   * The spacer is `aria-hidden` and the caller is responsible for making its
   * contents pointer-transparent; nothing decorative should be reachable.
   */
  midSlot?: React.ReactNode;
  /**
   * Set when `backdrop` is a moving field rather than a static wash. It moves
   * the eyebrow and the lede up to `--color-muted-bright`, because
   * `--color-muted` only clears 4.5:1 against the flat page background — the
   * hero hook and these two lines are the same case, and the contrast maths
   * behind it is in `grainient.tsx`.
   */
  onField?: boolean;
  children: React.ReactNode;
}) {
  const supporting = onField ? "text-muted-bright" : "text-muted";

  return (
    /* `relative` is load-bearing, not decoration: the backdrop is an absolutely
       positioned child. Without a positioning context here, those layers would
       resolve against the nearest positioned ancestor — the page — and stretch
       across the whole document instead of this section. */
    <section
      id={id}
      aria-labelledby={`${id}-title`}
      className="relative scroll-mt-24 py-20 md:py-28"
    >
      {backdrop ? (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 overflow-hidden"
        >
          {backdrop}
        </div>
      ) : null}

      {/* Two reading columns rather than one wrapper around everything. The gap
          between them is a full-width spacer, which is the only arrangement that
          satisfies both of `midSlot`'s requirements at once: the layer has to
          sit *between* the header and the body, and it has to be full-bleed. A
          layer placed inside a single reading column can only ever be 976px, and
          forcing it wider from in there needs negative insets plus
          `overflow-x: clip` on the section.

          The spacer being a direct child of `<section>` is what makes `w-full`
          mean the section's full width, and it is also the body's top margin, so
          the children need none of their own. Both columns are `relative` for
          the same reason the single wrapper was: they have to sit above the
          backdrop in the paint order. */}
      <div className="relative mx-auto w-full max-w-5xl px-6">
        <div className="flex items-baseline gap-4 border-b border-line pb-4">
          <span className="font-mono text-xs text-accent-bright">{index}</span>
          <p className={`type-eyebrow ${supporting}`}>{eyebrow}</p>
        </div>

        <h2
          id={`${id}-title`}
          className="type-display mt-6 text-3xl text-fg md:text-4xl"
        >
          {title}
        </h2>

        {lede ? (
          <p className={`mt-4 max-w-2xl leading-relaxed ${supporting}`}>
            {lede}
          </p>
        ) : null}
      </div>

      {midSlot ? (
        <div aria-hidden className="relative h-[120px] w-full">
          {midSlot}
        </div>
      ) : null}

      <div className="relative mx-auto w-full max-w-5xl px-6">{children}</div>
    </section>
  );
}
