import Image from "next/image";

const PHONE_DISPLAY = "689-123-4567";
const PHONE_TEL = "tel:+16891234567";
const CONTACT_EMAIL = "Knightsofthehigherorder@gmail.com";

// The radiant cross mark is a static, pre-rendered vector asset
// (public/kothom-mark.svg) rather than something laid out at runtime: the
// wordmark's arced letters are baked in as real glyph outline paths, so the
// exact same file is both what the site displays and what can be handed to
// a print shop for business cards, etc., with no font or JS dependency.
// Regenerate it with `node scripts/generate-kothom-mark.cjs` if the design
// changes — see that script for the one-time font setup it needs.
function CrossMark({ size = "large" }: { size?: "large" | "small" }) {
  return (
    <Image
      src="/kothom-mark.svg"
      alt="Knights of the Higher Order Ministries"
      width={250}
      height={292}
      priority={size === "large"}
      className={`h-auto shrink-0 ${size === "large" ? "w-[240px] sm:w-[300px]" : "w-[135px] sm:w-[165px]"}`}
    />
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
