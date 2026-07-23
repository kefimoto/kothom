import { pages } from "#site/content";
import { DonateButton } from "@/components/donate-button";
import { DonorPortalForm } from "@/components/donor-portal-form";
import { GivingForm } from "@/components/giving-form";
import { PageHeader } from "@/components/page-header";
import { Prose } from "@/components/prose";
import { RollOfHonor } from "@/components/roll-of-honor";
import { buildMetadata } from "@/lib/metadata";
import { CAN_ACCEPT_ONLINE_DONATIONS } from "@/lib/ministry";
import { getRollOfHonor } from "@/lib/roll-of-honor";

function getPage() {
  const found = pages.find((p) => p.slug === "give");
  if (!found) throw new Error("Missing content/pages/give.md");
  return found;
}
const page = getPage();

export const metadata = buildMetadata({
  title: page.title,
  description: page.description,
  path: "/give",
});

export default async function GivePage() {
  const proseHtml = CAN_ACCEPT_ONLINE_DONATIONS
    ? page.body
        .replace(/<h2[^>]*id="how-giving-works-today"[^>]*>[\s\S]*$/i, "")
        .trim()
    : page.body;
  const { year, supporters, anonymousDonorCount } = await getRollOfHonor();

  return (
    <main id="main">
      <PageHeader title={page.title} description={page.description} />
      <div className="bg-cream px-6 py-16 sm:py-20">
        <Prose html={proseHtml} className="mx-auto max-w-3xl" />
      </div>

      {CAN_ACCEPT_ONLINE_DONATIONS && <GivingForm />}

      <section id="become-a-knight" className="bg-ink px-6 py-20 sm:py-28">
        <div className="mx-auto flex max-w-3xl flex-col items-start gap-5">
          <h2 className="font-headline text-2xl text-cream sm:text-3xl">
            Become a Knight
          </h2>
          <p className="text-pretty font-body text-lg leading-relaxed text-cream/90">
            Your gift of $25 or more — monthly, annual, or one-time — makes you
            a Knight. Reach out and we'll arrange it directly.
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

      {CAN_ACCEPT_ONLINE_DONATIONS && (
        <section
          id="manage"
          className="bg-cream border-t border-charcoal/10 px-6 py-20 sm:py-28"
        >
          <div className="mx-auto flex max-w-3xl flex-col items-start gap-5">
            <h2 className="font-headline text-2xl text-charcoal sm:text-3xl">
              Manage Existing Subscription
            </h2>
            <p className="text-pretty font-body text-lg leading-relaxed text-charcoal">
              Enter your email address below to access your donor portal where
              you can update payment methods, pause giving, or cancel your
              subscription without needing a password.
            </p>
            <DonorPortalForm />
          </div>
        </section>
      )}

      <RollOfHonor
        supporters={supporters}
        year={year}
        anonymousDonorCount={anonymousDonorCount}
      />
    </main>
  );
}
