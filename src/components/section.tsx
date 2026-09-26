export function Section({
  id,
  eyebrow,
  title,
  children,
}: {
  id: string;
  eyebrow: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="scroll-mt-24 py-20 md:py-28">
      <div className="mx-auto w-full max-w-5xl px-6">
        <p className="type-eyebrow text-accent">{eyebrow}</p>
        <h2
          id={`${id}-title`}
          className="type-display mt-3 text-3xl font-bold text-ink md:text-4xl"
        >
          {title}
        </h2>
        {children}
      </div>
    </section>
  );
}
