export function Section({
  id,
  index,
  eyebrow,
  title,
  lede,
  tone = "default",
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
   * `brand` fills the section with `--color-accent-deep` and moves the muted
   * text up to `--color-accent-bright`. It has to: muted is 4.43:1 on that
   * fill, just under the 4.5 AA threshold for body text, and `--color-line` is
   * 1:1 there, so the default hairline would vanish entirely.
   */
  tone?: "default" | "brand";
  children: React.ReactNode;
}) {
  const onBrand = tone === "brand";

  return (
    /* `relative` is load-bearing, not decoration: the Work/Skills ambience is an
       absolutely positioned sibling. Without a positioning context here, that
       layer wins the paint order over the static section and its blobs tint the
       copy instead of sitting behind it. */
    <section
      id={id}
      aria-labelledby={`${id}-title`}
      className={`relative scroll-mt-24 py-20 md:py-28 ${
        onBrand ? "bg-accent-deep" : ""
      }`}
    >
      <div className="mx-auto w-full max-w-5xl px-6">
        <div
          className={`flex items-baseline gap-4 border-b pb-4 ${
            onBrand ? "border-accent/50" : "border-line"
          }`}
        >
          <span className="font-mono text-xs text-accent-bright">{index}</span>
          <p
            className={`type-eyebrow ${
              onBrand ? "text-accent-bright" : "text-muted"
            }`}
          >
            {eyebrow}
          </p>
        </div>

        <h2
          id={`${id}-title`}
          className="type-display mt-6 text-3xl text-fg md:text-4xl"
        >
          {title}
        </h2>

        {lede ? (
          <p
            className={`mt-4 max-w-2xl leading-relaxed ${
              onBrand ? "text-accent-bright" : "text-muted"
            }`}
          >
            {lede}
          </p>
        ) : null}

        {children}
      </div>
    </section>
  );
}
