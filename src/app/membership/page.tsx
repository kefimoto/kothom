import { ctaClassName } from "@/components/cta";
import { DonorPortalForm } from "@/components/donor-portal-form";
import { PageHeader } from "@/components/page-header";
import { buildMetadata } from "@/lib/metadata";
import { MINISTRY } from "@/lib/ministry";

export const metadata = buildMetadata({
  title: "Manage Your Membership",
  description:
    "Access your donor self-service portal to update payment methods, pause, or cancel recurring gifts without a password.",
  path: "/membership",
});

export default function MembershipPage() {
  return (
    <main id="main">
      <PageHeader
        title="Manage Your Membership"
        description="Access your donor portal to manage payment methods, pause, or cancel your recurring giving anytime."
      />
      <div className="bg-cream px-6 py-16 sm:py-20">
        <div className="mx-auto flex max-w-3xl flex-col gap-10">
          <div className="flex flex-col gap-4 border border-charcoal/10 bg-cream p-6 sm:p-8">
            <h2 className="font-headline text-2xl text-charcoal sm:text-3xl">
              Passwordless Donor Portal Access
            </h2>
            <p className="max-w-[70ch] text-pretty font-body text-lg leading-relaxed text-charcoal">
              Enter the email address you used when setting up your recurring
              gift. We will generate a secure link to access your Stripe
              customer portal where you can manage or cancel your subscription
              instantly — no password required.
            </p>
            <DonorPortalForm />
          </div>

          <div className="flex flex-col gap-4">
            <h2 className="font-headline text-2xl text-charcoal sm:text-3xl">
              To change, pause, or stop a gift by phone or email
            </h2>
            <p className="max-w-[70ch] text-pretty font-body text-lg leading-relaxed text-charcoal">
              You can also call or email us directly and tell us what you'd like
              to change. There's no cancellation fee and no minimum commitment.
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
              The same portal or call/email works for updating your mailing
              address or any other contact information we have on file for you.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
