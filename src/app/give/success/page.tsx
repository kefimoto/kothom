import Link from "next/link";
import { ctaClassName } from "@/components/cta";
import { PageHeader } from "@/components/page-header";
import { buildMetadata } from "@/lib/metadata";

export const metadata = buildMetadata({
  title: "Donation Received",
  description:
    "Thank you for your generous gift to Knights of the Higher Order Ministries.",
  path: "/give/success",
});

export default function DonateSuccessPage() {
  return (
    <main id="main">
      <PageHeader
        title="Thank You"
        description="Your donation has been received."
      />
      <div className="bg-cream px-6 py-16 sm:py-20">
        <div className="mx-auto max-w-3xl">
          <p className="mb-8 text-pretty font-body text-lg leading-relaxed text-charcoal">
            Your generous gift has been received and will make a real difference
            in the lives of single-parent families in Central Florida. A
            confirmation email is on its way to you.
          </p>

          <div className="mb-8 flex flex-col gap-4 border border-charcoal/10 bg-cream p-6 sm:p-8">
            <h2 className="font-headline text-2xl text-charcoal">
              What Happens Next
            </h2>
            <ol className="space-y-4">
              <li className="flex gap-4">
                <span className="flex-shrink-0 font-headline font-semibold text-charcoal">
                  1.
                </span>
                <div>
                  <h3 className="font-headline font-semibold text-charcoal">
                    Confirmation Email
                  </h3>
                  <p className="font-body text-charcoal/70">
                    Check your email for a receipt and tax documentation.
                  </p>
                </div>
              </li>
              <li className="flex gap-4">
                <span className="flex-shrink-0 font-headline font-semibold text-charcoal">
                  2.
                </span>
                <div>
                  <h3 className="font-headline font-semibold text-charcoal">
                    Manage Your Subscription
                  </h3>
                  <p className="font-body text-charcoal/70">
                    For recurring gifts, you can update, pause, or cancel
                    anytime by visiting the{" "}
                    <Link
                      href="/membership"
                      className="font-semibold text-terracotta hover:underline"
                    >
                      membership page
                    </Link>
                    .
                  </p>
                </div>
              </li>
              <li className="flex gap-4">
                <span className="flex-shrink-0 font-headline font-semibold text-charcoal">
                  3.
                </span>
                <div>
                  <h3 className="font-headline font-semibold text-charcoal">
                    Stay Connected
                  </h3>
                  <p className="font-body text-charcoal/70">
                    We'll keep you updated on how your gift is making a
                    difference. You can update your preferences anytime.
                  </p>
                </div>
              </li>
            </ol>
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
