export function Section({
  id,
  index,
  eyebrow,
  title,
  lede,
  children,
}: {
  id: string;
  /** Two-digit ordinal shown against the eyebrow, e.g. "02". */
  index: string;
  eyebrow: string;
  title: string;
  /** Optional supporting line, rendered under the title. */
  lede?: string;
  children: React.ReactNode;
}) {
  return (
    /* `relative` is load-bearing, not decoration: the Work/Skills ambience is an
       absolutely positioned sibling. Without a positioning context here, that
       layer wins the paint order over the static section and its blobs tint the
       copy instead of sitting behind it. */
    <section
      id={id}
      aria-labelledby={`${id}-title`}
      className="relative scroll-mt-24 py-20 md:py-28"
    >
      <div className="mx-auto w-full max-w-5xl px-6">
        <div className="flex items-baseline gap-4 border-b border-line pb-4">
          <span className="font-mono text-xs text-accent-bright">{index}</span>
          <p className="type-eyebrow text-muted">{eyebrow}</p>
        </div>

        <h2
          id={`${id}-title`}
          className="type-display mt-6 text-3xl text-fg md:text-4xl"
        >
          {title}
        </h2>

        {lede ? (
          <p className="mt-4 max-w-2xl leading-relaxed text-muted">{lede}</p>
        ) : null}

        {children}
      </div>
    </section>
  );
}
