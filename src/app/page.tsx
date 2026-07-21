import Image from "next/image";

const PHONE_DISPLAY = "689-123-4567";
const PHONE_TEL = "tel:+16891234567";
const CONTACT_EMAIL = "Knightsofthehigherorder@gmail.com";

// iOS Safari's support for textPath + textLength/lengthAdjust is unreliable
// (it can both truncate the text and shift it off-center), so the arced
// wordmark is laid out by hand: each character gets its own x/y and rotation
// computed from a circle, rather than relying on <textPath>.
//
// Per-character advance widths (measured via getComputedTextLength() in
// Chrome at font-size 20 in the "Cinzel Decorative" font) so letters are
// spaced by their real rendered width instead of an approximate average —
// using an average caused wide letters to overlap and narrow ones to gap.
const WORDMARK_TEXT = "KNIGHTS OF THE HIGHER ORDER";
const WORDMARK_CHAR_WIDTHS_AT_20 = [
  15.23, 17.31, 9.13, 17.23, 17.23, 13.97, 12.47, 5, 18.61, 13.14, 5, 13.97,
  17.23, 13.41, 5, 17.23, 9.13, 17.23, 17.23, 13.41, 14.63, 5, 18.61, 14.63,
  17.25, 13.41, 14.63,
];

function computeArcChars(
  text: string,
  charWidthsAtFontSize20: number[],
  fontSize: number,
  config: { centerX: number; centerY: number; radius: number },
) {
  const { centerX, centerY, radius } = config;
  const scale = fontSize / 20;
  const widths = charWidthsAtFontSize20.map((w) => w * scale);
  const total = widths.reduce((sum, w) => sum + w, 0);
  let cumulative = 0;
  return text.split("").map((char, i) => {
    const centerCumulative = cumulative + widths[i] / 2;
    cumulative += widths[i];
    const distanceFromCenter = centerCumulative - total / 2;
    const angleRad = distanceFromCenter / radius;
    return {
      char,
      x: centerX + radius * Math.sin(angleRad),
      y: centerY - radius * Math.cos(angleRad),
      rotation: (angleRad * 180) / Math.PI,
    };
  });
}

function CrossMark({ size = "large" }: { size?: "large" | "small" }) {
  // Crossbar intersection point.
  const cx = 100;
  const cy = 66;

  const hotspotId = `hotspot-${size}`;
  const softenId = `soften-${size}`;

  // The arc's two ends dip down closer to the cross than its curved middle
  // does (that's what curving means), so "the same distance from the cross"
  // can't hold at every point along it. What a viewer actually compares is
  // the gap directly above the cross's centerline — the peak of the arc —
  // against the flat gap below to "Ministries", so that's the pair this is
  // tuned to match, rather than the arc's (much closer) outer endpoints.
  //
  // Curvature (radius 184, ~60° half-span) is calibrated against the source
  // logo, where the wordmark wraps in a pronounced dome with its two ends
  // dipping down to nearly crossbar height.
  const wordmarkChars = computeArcChars(
    WORDMARK_TEXT,
    WORDMARK_CHAR_WIDTHS_AT_20,
    21,
    { centerX: cx, centerY: 176, radius: 184 },
  );

  return (
    <div className="flex flex-col items-center">
      <svg
        width={350}
        height={275}
        viewBox="-75 -25 350 275"
        aria-hidden="true"
        className={`h-auto shrink-0 ${size === "large" ? "w-[280px] sm:w-[360px]" : "w-[155px] sm:w-[200px]"}`}
      >
        <defs>
          <radialGradient id={hotspotId} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </radialGradient>
          <filter id={softenId} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3.2" />
          </filter>
        </defs>

        {/* Soft glow hugging the edges of the cross (not a background wash) */}
        <g filter={`url(#${softenId})`}>
          <rect x="86" y="6" width="28" height="190" fill="#f4efe6" />
          <rect x="30" y="50" width="140" height="32" fill="#f4efe6" />
        </g>

        {/* Crisp cross body — each arm flares slightly at the tip and
            tapers narrower as it approaches the center. */}
        <polygon
          fill="#f4efe6"
          points={`
            ${cx - 13},8 ${cx + 13},8
            ${cx + 11},53 ${cx + 11},79
            ${cx + 13},194 ${cx - 13},194
            ${cx - 11},79 ${cx - 11},53
          `}
        />
        <polygon
          fill="#f4efe6"
          points={`
            35,${cy - 15} 35,${cy + 15}
            89,${cy + 13} 111,${cy + 13}
            165,${cy + 15} 165,${cy - 15}
            111,${cy - 13} 89,${cy - 13}
          `}
        />

        {/* Bright hotspot at the intersection */}
        <circle cx={cx} cy={cy} r="34" fill={`url(#${hotspotId})`} />

        {/* Wordmark arced above the cross */}
        <g fill="#f4efe6" fontSize="21" textAnchor="middle" className="font-display">
          {wordmarkChars.map(
            (p, i) =>
              p.char !== " " && (
                <text
                  key={i}
                  x={p.x}
                  y={p.y}
                  transform={`rotate(${p.rotation} ${p.x} ${p.y})`}
                >
                  {p.char}
                </text>
              ),
          )}
        </g>

        {/* "Ministries" set below the cross */}
        <text
          x={cx}
          y="228"
          fontSize="19"
          letterSpacing="3"
          fill="#c9a876"
          textAnchor="middle"
          className="font-headline uppercase"
        >
          Ministries
        </text>
      </svg>
      <span className="sr-only">Knights of the Higher Order Ministries</span>
    </div>
  );
}

function CtaLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      className="inline-block rounded-none bg-terracotta px-8 py-3.5 font-headline text-base font-semibold tracking-wide text-cream transition-colors hover:bg-terracotta-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tan-gold"
    >
      {children}
    </a>
  );
}

export default function Home() {
  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-none focus:bg-cream focus:px-4 focus:py-2 focus:font-headline focus:text-ink"
      >
        Skip to main content
      </a>

      <main id="main">
        {/* Hero */}
        <section className="bg-ink px-6 py-24 text-center sm:py-32">
          <div className="mx-auto flex max-w-3xl flex-col items-center gap-10">
            <CrossMark size="large" />
            <h1 className="text-balance font-display text-4xl leading-tight tracking-[0.01em] text-cream [text-shadow:0_2px_0_rgba(0,0,0,0.4)] sm:text-6xl">
              Spreading His Word,
              <br />
              One Family At A Time
            </h1>
          </div>
        </section>

        {/* Split action zone: Get Help / Give */}
        <section id="get-help" className="bg-cream px-6 py-20 sm:py-28">
          <div className="mx-auto grid max-w-5xl gap-12 sm:grid-cols-2 sm:gap-10">
            <div className="flex flex-col items-start gap-4">
              <h2 className="font-headline text-2xl text-charcoal sm:text-3xl">
                Need Help?
              </h2>
              <p className="text-pretty font-body text-lg leading-relaxed text-charcoal">
                If you&apos;re a single parent struggling with bills, food, or
                housing, you don&apos;t have to carry it alone. Call us — a real
                person will answer.
              </p>
              <CtaLink href={PHONE_TEL}>Call {PHONE_DISPLAY}</CtaLink>
            </div>
            <div className="flex flex-col items-start gap-4">
              <h2 className="font-headline text-2xl text-charcoal sm:text-3xl">
                Want to Give?
              </h2>
              <p className="text-pretty font-body text-lg leading-relaxed text-charcoal">
                Your gift — big or small, now or planned — goes directly to
                single-parent families in Central Florida, and makes you a
                Knight.
              </p>
              <CtaLink href="#give">See How to Give</CtaLink>
            </div>
          </div>
        </section>

        {/* Mission */}
        <section className="bg-ink px-6 py-20 sm:py-28">
          <div className="mx-auto grid max-w-5xl gap-10 sm:grid-cols-2 sm:gap-16">
            <h2 className="text-balance font-headline text-3xl leading-tight text-cream sm:text-4xl">
              A Ministry Built On Salvation With A Desire To Help Single Parents
              And Their Children.
            </h2>
            <div className="flex flex-col gap-5 font-body text-lg leading-relaxed text-cream/90">
              <p className="max-w-[70ch] text-pretty">
                Knights of the Higher Order Ministries is a Christian-based
                nonprofit dedicated to assisting single parents and their
                children with overcoming the struggles of life. We change lives
                by having direct contact with single-parent families, learning
                of their struggles, and formulating a mutually agreed-upon plan
                that addresses the issues impacting their lives.
              </p>
              <p className="max-w-[70ch] text-pretty">
                We offer direct financial assistance with utility bills,
                clothing costs, food, and housing expenses — but not limited to
                these.
              </p>
            </div>
          </div>
        </section>

        {/* How You Can Help */}
        <section id="give" className="bg-cream px-6 py-20 sm:py-28">
          <div className="mx-auto max-w-5xl">
            <h2 className="mb-12 text-center font-headline text-3xl text-charcoal sm:text-4xl">
              How You Can Help
            </h2>
            <div className="grid gap-12 sm:grid-cols-2 sm:gap-10">
              <div className="flex flex-col gap-5">
                <figure className="m-0">
                  <Image
                    src="/images/become-a-knight.jpg"
                    alt="A family sitting together in a church pew"
                    width={800}
                    height={533}
                    className="block w-full"
                  />
                  <figcaption className="bg-terracotta px-6 py-4">
                    <span className="font-headline text-lg text-cream">
                      Become a Knight
                    </span>
                  </figcaption>
                </figure>
                <p className="text-pretty font-body text-lg leading-relaxed text-charcoal">
                  An annual gift of $25 or more goes directly to helping
                  single-parent families — and makes you a Knight. Members
                  receive a Knights of the Higher Order T-shirt.
                </p>
                <CtaLink
                  href={`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(
                    "Become a Knight",
                  )}`}
                >
                  Join the Ranks
                </CtaLink>
              </div>
              <div className="flex flex-col gap-5">
                <figure className="m-0">
                  <Image
                    src="/images/legacy-donations.jpg"
                    alt="An ornate, aged chapel interior with stained glass windows"
                    width={800}
                    height={533}
                    className="block w-full"
                  />
                  <figcaption className="bg-terracotta px-6 py-4">
                    <span className="font-headline text-lg text-cream">
                      Legacy Donations
                    </span>
                  </figcaption>
                </figure>
                <p className="text-pretty font-body text-lg leading-relaxed text-charcoal">
                  Include a legacy gift in your will, living trust, or as a
                  beneficiary designation, and make a lasting impact on
                  single-parent households in Central Florida. Legacy donors are
                  Knights too.
                </p>
                <CtaLink
                  href={`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(
                    "Legacy Donations Inquiry",
                  )}`}
                >
                  Learn More
                </CtaLink>
              </div>
            </div>
          </div>
        </section>

        {/* Pastoral Services */}
        <section id="pastoral-services" className="bg-ink px-6 py-20 sm:py-28">
          <div className="mx-auto grid max-w-5xl items-center gap-10 sm:grid-cols-2 sm:gap-16">
            <Image
              src="/images/pastoral-services.jpg"
              alt="Hands folded in prayer over an open Bible"
              width={800}
              height={533}
              className="block w-full"
            />
            <div className="flex flex-col items-start gap-5">
              <h2 className="font-headline text-3xl text-cream sm:text-4xl">
                Pastoral Services
              </h2>
              <p className="text-pretty font-body text-lg leading-relaxed text-cream/90">
                Our work in the community isn&apos;t limited to financial help.
                We offer pastoral care on call and by appointment — available 24
                hours a day, 7 days a week, 365 days a year.
              </p>
              <CtaLink href={PHONE_TEL}>Call {PHONE_DISPLAY}</CtaLink>
            </div>
          </div>
        </section>

        {/* Contact / Footer */}
        <footer id="contact" className="bg-ink px-6 py-20 sm:py-28">
          <div className="mx-auto flex max-w-5xl flex-col items-center gap-16">
            <CrossMark size="small" />
            <div className="grid w-full gap-12 sm:grid-cols-2">
              <div>
                <h2 className="mb-4 border-b border-tan-gold/40 pb-2 font-headline text-lg uppercase tracking-wide text-tan-gold">
                  Contact Us
                </h2>
                <address className="flex flex-col gap-1 font-body text-base not-italic leading-relaxed text-cream/90">
                  <span>President and Founder</span>
                  <span>Pastor Andrew S. Trexler (Pastor T)</span>
                  <span className="mt-2">380 Lake Ontario Court</span>
                  <span>Altamonte Springs, FL 32701</span>
                  <a
                    href={PHONE_TEL}
                    className="mt-2 underline decoration-tan-gold/50 underline-offset-2 hover:text-cream"
                  >
                    {PHONE_DISPLAY}
                  </a>
                  <a
                    href={`mailto:${CONTACT_EMAIL}`}
                    className="underline decoration-tan-gold/50 underline-offset-2 hover:text-cream"
                  >
                    {CONTACT_EMAIL}
                  </a>
                  <a
                    href="https://knightsofthehigherorderministries.org"
                    className="underline decoration-tan-gold/50 underline-offset-2 hover:text-cream"
                  >
                    knightsofthehigherorderministries.org
                  </a>
                </address>
              </div>
              <div>
                <h2 className="mb-4 border-b border-tan-gold/40 pb-2 font-headline text-lg uppercase tracking-wide text-tan-gold">
                  Ministry Official Office Hours
                </h2>
                <p className="font-body text-base leading-relaxed text-cream/90">
                  Monday – Sunday: 10am – 5pm
                </p>
              </div>
            </div>
            <p className="font-body text-sm text-cream/60">
              &copy; {new Date().getFullYear()} Knights of the Higher Order
              Ministries
            </p>
          </div>
        </footer>
      </main>
    </>
  );
}
