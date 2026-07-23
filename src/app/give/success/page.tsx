import Link from "next/link";
import { ctaClassName } from "@/components/cta";

export const metadata = {
  title: "Donation Received",
  description:
    "Thank you for your generous gift to Knights of the Higher Order Ministries.",
};

export default function DonateSuccessPage() {
  return (
    <main id="main" className="min-h-screen bg-cream flex flex-col">
      <div className="flex-1 px-6 py-16 sm:py-24">
        <div className="mx-auto max-w-2xl">
          <div className="mb-8 text-center">
            <div className="mb-6 inline-block">
              <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
                <svg
                  className="h-8 w-8 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <title>Donation confirmed</title>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
            </div>
            <h1 className="font-headline text-3xl sm:text-4xl text-charcoal mb-4">
              Thank You
            </h1>
            <p className="font-body text-lg text-charcoal/80 leading-relaxed mb-2">
              Your generous gift has been received and will make a real
              difference in the lives of single-parent families in Central
              Florida.
            </p>
            <p className="font-body text-base text-charcoal/60">
              A confirmation email is on its way to you.
            </p>
          </div>

          <div className="border border-charcoal/20 bg-white rounded-none p-8 mb-8">
            <h2 className="font-headline text-xl text-charcoal mb-6">
              What Happens Next
            </h2>
            <ul className="space-y-4">
              <li className="flex gap-4">
                <div className="flex-shrink-0 mt-1">
                  <div className="h-6 w-6 rounded-full bg-tan-gold/20 flex items-center justify-center">
                    <span className="text-sm font-semibold text-tan-gold">
                      1
                    </span>
                  </div>
                </div>
                <div>
                  <h3 className="font-headline font-semibold text-charcoal">
                    Confirmation Email
                  </h3>
                  <p className="font-body text-charcoal/70 text-sm">
                    Check your email for a receipt and tax documentation.
                  </p>
                </div>
              </li>
              <li className="flex gap-4">
                <div className="flex-shrink-0 mt-1">
                  <div className="h-6 w-6 rounded-full bg-tan-gold/20 flex items-center justify-center">
                    <span className="text-sm font-semibold text-tan-gold">
                      2
                    </span>
                  </div>
                </div>
                <div>
                  <h3 className="font-headline font-semibold text-charcoal">
                    Manage Your Subscription
                  </h3>
                  <p className="font-body text-charcoal/70 text-sm">
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
                <div className="flex-shrink-0 mt-1">
                  <div className="h-6 w-6 rounded-full bg-tan-gold/20 flex items-center justify-center">
                    <span className="text-sm font-semibold text-tan-gold">
                      3
                    </span>
                  </div>
                </div>
                <div>
                  <h3 className="font-headline font-semibold text-charcoal">
                    Stay Connected
                  </h3>
                  <p className="font-body text-charcoal/70 text-sm">
                    We'll keep you updated on how your gift is making a
                    difference. You can update your preferences anytime.
                  </p>
                </div>
              </li>
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
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
