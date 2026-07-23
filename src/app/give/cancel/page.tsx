import Link from "next/link";
import { ctaClassName } from "@/components/cta";
import { PageHeader } from "@/components/page-header";
import { buildMetadata } from "@/lib/metadata";
import { MINISTRY } from "@/lib/ministry";

export const metadata = buildMetadata({
  title: "Donation Cancelled",
  description: "No worries. We'd love to hear from you.",
  path: "/give/cancel",
});

export default function DonateCancelPage() {
  return (
    <main id="main">
      <PageHeader
        title="No Worries"
        description="We understand — giving is a big decision, and we respect yours."
      />
      <div className="bg-cream px-6 py-16 sm:py-20">
        <div className="mx-auto max-w-3xl">
          <div className="mb-8 flex flex-col gap-4 border border-charcoal/10 bg-cream p-6 sm:p-8">
            <h2 className="font-headline text-2xl text-charcoal">
              If you have questions
            </h2>
            <p className="font-body text-charcoal/70">
              We're here to help. Reach out and let's talk about how we can
              serve your heart:
            </p>
            <div className="space-y-4">
              <div>
                <p className="font-headline font-semibold text-charcoal mb-1">
                  Call us
                </p>
                <p className="font-body text-charcoal/70">
                  <a
                    href={MINISTRY.phone.tel}
                    className="text-terracotta hover:underline"
                  >
                    {MINISTRY.phone.display}
                  </a>
                </p>
              </div>
              <div>
                <p className="font-headline font-semibold text-charcoal mb-1">
                  Email us
                </p>
                <p className="font-body text-charcoal/70">
                  <a
                    href={`mailto:${MINISTRY.email}`}
                    className="text-terracotta hover:underline"
                  >
                    {MINISTRY.email}
                  </a>
                </p>
              </div>
              <div>
                <p className="font-headline font-semibold text-charcoal mb-1">
                  Write us
                </p>
                <p className="font-body text-charcoal/70">
                  {MINISTRY.address.street}
                  <br />
                  {MINISTRY.address.city}, {MINISTRY.address.state}{" "}
                  {MINISTRY.address.zip}
                </p>
              </div>
            </div>
          </div>

          <div className="mb-8 flex flex-col gap-4 border border-charcoal/10 bg-cream p-6 sm:p-8">
            <h3 className="font-headline text-2xl text-charcoal">
              Other ways to help
            </h3>
            <p className="font-body text-charcoal/70">
              If online giving isn't right for you now, there are other ways to
              support the mission:
            </p>
            <ul className="space-y-2 font-body text-charcoal/70">
              <li>• Give by check, mailed to our address above</li>
              <li>• Call us to arrange a direct gift</li>
              <li>• Explore legacy and planned giving options</li>
              <li>• Volunteer your time and skills</li>
            </ul>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Link href="/give" className={ctaClassName}>
              Back to Giving
            </Link>
            <Link
              href="/"
              className="px-6 py-3 font-headline text-sm font-semibold uppercase tracking-wider text-charcoal border border-charcoal/30 hover:bg-charcoal/5 transition-colors rounded-none text-center"
            >
              Home
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
