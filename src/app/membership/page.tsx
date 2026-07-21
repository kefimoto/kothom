// Placeholder page for a future account/billing portal. Today there is no
// login and no recurring online giving to manage — this page exists so a
// donor who wants to change, pause, or stop a gift (or update an address)
// has a real, working answer right now, instead of a "coming soon" dead end.
//
// Once Stripe (or similar) is wired up per COMPLIANCE.md's "Before switching
// on real payments" checklist — including a published cancellation policy
// and a way to cancel without logging in — this is where the account portal
// (sign-in, manage recurring gift, update payment method) attaches.
import type { Metadata } from "next";
import { ctaClassName } from "@/components/cta";
import { PageHeader } from "@/components/page-header";
import { MINISTRY } from "@/lib/ministry";

export const metadata: Metadata = {
  title: "Manage Your Membership",
  description:
    "Recurring online giving isn't offered yet. To change, pause, or stop a gift, or update your address, call or email us directly.",
  alternates: { canonical: "/membership" },
};

export default function MembershipPage() {
  return (
    <main id="main">
      <PageHeader
        title="Manage Your Membership"
        description="There's no online account to log into yet — but changing or stopping a gift is still simple. Call or email us."
      />
      <div className="bg-cream px-6 py-16 sm:py-20">
        <div className="mx-auto flex max-w-3xl flex-col gap-10">
          <div className="flex flex-col gap-4">
            <h2 className="font-headline text-2xl text-charcoal sm:text-3xl">
              Why there's no account portal yet
            </h2>
            <p className="max-w-[70ch] text-pretty font-body text-lg leading-relaxed text-charcoal">
              We don't yet process gifts or recurring giving through this
              website — every gift today is arranged directly with us, by check,
              in person, or by agreement over the phone. Because there's no
              online billing, there's nothing to log into. That's changing, but
              until it does, managing your membership means talking to a real
              person, the same way giving does.
            </p>
          </div>

          <div className="flex flex-col gap-4">
            <h2 className="font-headline text-2xl text-charcoal sm:text-3xl">
              To change, pause, or stop a gift
            </h2>
            <p className="max-w-[70ch] text-pretty font-body text-lg leading-relaxed text-charcoal">
              Call or email us and tell us what you'd like to change. There's no
              cancellation fee, no minimum commitment, and you never need a
              login to do it.
            </p>
            <div className="flex flex-wrap gap-4">
              <a href={MINISTRY.phone.tel} className={ctaClassName}>
                Call {MINISTRY.phone.display}
              </a>
              <a
                href={`mailto:${MINISTRY.email}?subject=${encodeURIComponent(
                  "Manage My Membership",
                )}`}
                className={ctaClassName}
              >
                Email Us
              </a>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <h2 className="font-headline text-2xl text-charcoal sm:text-3xl">
              To update your address
            </h2>
            <p className="max-w-[70ch] text-pretty font-body text-lg leading-relaxed text-charcoal">
              The same call or email works for updating your mailing address or
              any other contact information we have on file for you.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
