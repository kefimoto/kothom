// The opening band of every interior page. Ink, so it continues the header bar
// above it into one unbroken dark block — then the page body switches to cream.
// That is the Duotone Rule (DESIGN.md §2) applied at page scale rather than
// section scale: a given surface is either black or cream, never a blend.
export function PageHeader({
  title,
  description,
  meta,
}: {
  title: string;
  description?: string;
  /** Small line above the title — a date, a section name. */
  meta?: React.ReactNode;
}) {
  return (
    <div className="bg-ink px-6 py-16 sm:py-20">
      <div className="mx-auto flex max-w-3xl flex-col gap-4">
        {meta && <p className="font-body text-base text-tan-gold">{meta}</p>}
        <h1 className="text-balance font-headline text-3xl leading-tight text-cream sm:text-4xl">
          {title}
        </h1>
        {description && (
          <p className="max-w-[70ch] text-pretty font-body text-lg leading-relaxed text-cream/90">
            {description}
          </p>
        )}
      </div>
    </div>
  );
}
