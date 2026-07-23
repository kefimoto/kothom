interface RollOfHonorProps {
  supporters: Array<{ id: string; name: string; year: number }>;
  year: number;
  anonymousDonorCount: number;
}

export function RollOfHonor({
  supporters,
  year,
  anonymousDonorCount,
}: RollOfHonorProps) {
  return (
    <section
      id="roll-of-honor"
      className="bg-ink border-t border-tan-gold/30 px-6 py-20 text-cream sm:py-28"
    >
      <div className="mx-auto max-w-4xl">
        <div className="mb-10 flex flex-col items-start gap-4">
          <span className="font-semibold text-xs text-tan-gold uppercase tracking-widest">
            {year} Recognition
          </span>
          <h2 className="font-headline text-2xl text-cream sm:text-3xl">
            Supporter Roll of Honor
          </h2>
          <p className="max-w-2xl font-body text-cream/90 text-lg leading-relaxed text-pretty">
            We honor and give thanks to the faithful individuals, families, and
            organizations whose generous gifts empower our mission to serve
            single-parent families in Central Florida.
          </p>
        </div>

        {supporters.length === 0 && anonymousDonorCount === 0 ? (
          <div className="border border-cream/20 bg-charcoal/40 p-8 text-center font-body text-cream/70 rounded-none">
            No supporters listed for {year} yet.
          </div>
        ) : (
          <>
            {supporters.length > 0 && (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 mb-8">
                {supporters.map((supporter) => (
                  <div
                    key={supporter.id}
                    className="border border-tan-gold/30 bg-charcoal/40 p-6 rounded-none"
                  >
                    <h3 className="font-headline font-semibold text-cream text-lg">
                      {supporter.name}
                    </h3>
                  </div>
                ))}
              </div>
            )}
            {anonymousDonorCount > 0 && (
              <div className="border border-cream/20 bg-charcoal/40 p-6 text-center font-body text-cream/70 rounded-none">
                Plus {anonymousDonorCount} anonymous{" "}
                {anonymousDonorCount === 1 ? "gift" : "gifts"} this year.
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
