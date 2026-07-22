import type { Metadata } from "next";
import { pages } from "#site/content";
import { DonateButton } from "@/components/donate-button";
import { DonorPortalForm } from "@/components/donor-portal-form";
import { PageHeader } from "@/components/page-header";
import { Prose } from "@/components/prose";

function getPage() {
  const found = pages.find((p) => p.slug === "give");
  if (!found) throw new Error("Missing content/pages/give.md");
  return found;
}
const page = getPage();

export const metadata: Metadata = {
  title: page.title,
  description: page.description,
  alternates: { canonical: "/give" },
};

export default function GivePage() {
  return (
    <main id="main">
      <PageHeader title={page.title} description={page.description} />
      <div className="bg-cream px-6 py-16 sm:py-20">
        <Prose html={page.body} className="mx-auto max-w-3xl" />
      </div>

      <section id="become-a-knight" className="bg-ink px-6 py-20 sm:py-28">
        <div className="mx-auto flex max-w-3xl flex-col items-start gap-5">
          <h2 className="font-headline text-2xl text-cream sm:text-3xl">
            Become a Knight
          </h2>
          <p className="text-pretty font-body text-lg leading-relaxed text-cream/90">
            An annual gift of $25 or more, including a Knights of the Higher
            Order T-shirt. Reach out and we'll arrange it directly.
          </p>
          <DonateButton intent="knight">Join the Ranks</DonateButton>
        </div>
      </section>

      <section id="legacy" className="bg-cream px-6 py-20 sm:py-28">
        <div className="mx-auto flex max-w-3xl flex-col items-start gap-5">
          <h2 className="font-headline text-2xl text-charcoal sm:text-3xl">
            Legacy Donations
          </h2>
          <p className="text-pretty font-body text-lg leading-relaxed text-charcoal">
            Planned giving through your will, living trust, or a beneficiary
            designation. Reach out and we'll talk through what fits your plans.
          </p>
          <DonateButton intent="legacy">Learn More</DonateButton>
        </div>
      </section>

      <section
        id="manage"
        className="bg-cream border-t border-charcoal/10 px-6 py-20 sm:py-28"
      >
        <div className="mx-auto flex max-w-3xl flex-col items-start gap-5">
          <h2 className="font-headline text-2xl text-charcoal sm:text-3xl">
            Manage Existing Subscription
          </h2>
          <p className="text-pretty font-body text-lg leading-relaxed text-charcoal">
            Enter your email address below to access your donor portal where you
            can update payment methods, pause giving, or cancel your
            subscription without needing a password.
          </p>
          <DonorPortalForm />
        </div>
      </section>
    </main>
  );
}
