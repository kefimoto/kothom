import Link from "next/link";
import { legal, pages } from "#site/content";
import { PageHeader } from "@/components/page-header";
import { Prose } from "@/components/prose";
import { buildMetadata } from "@/lib/metadata";
import { LEGAL_STATUS, MAILING_ADDRESS, MINISTRY } from "@/lib/ministry";

function getPage() {
  const found = pages.find((p) => p.slug === "transparency");
  if (!found) throw new Error("Missing content/pages/transparency.md");
  return found;
}
const page = getPage();

export const metadata = buildMetadata({
  title: page.title,
  description: page.description,
  path: "/transparency",
});

// Each row reads directly off LEGAL_STATUS so this page can never drift from
// what src/lib/ministry.ts actually says. A null/false value renders as
// "Application in progress" rather than a blank or a fabricated number — see
// COMPLIANCE.md § "Where things stand today".
const FILINGS: {
  label: string;
  status: () => { done: boolean; detail: string };
}[] = [
  {
    label: "Florida nonprofit corporation",
    status: () => ({
      done: LEGAL_STATUS.isFloridaNonprofitCorp,
      detail: LEGAL_STATUS.isFloridaNonprofitCorp
        ? "Incorporated with the Florida Division of Corporations."
        : "Application in progress with the Florida Division of Corporations.",
    }),
  },
  {
    label: "Federal EIN",
    status: () => ({
      done: LEGAL_STATUS.ein !== null,
      detail:
        LEGAL_STATUS.ein !== null
          ? `EIN: ${LEGAL_STATUS.ein}`
          : "Application in progress with the IRS.",
    }),
  },
  {
    label: "IRS 501(c)(3) determination",
    status: () => ({
      done: LEGAL_STATUS.is501c3,
      detail: LEGAL_STATUS.is501c3
        ? "Determination letter received. Gifts are tax deductible."
        : "Application in progress with the IRS. Gifts are not yet tax deductible.",
    }),
  },
  {
    label: "Florida charitable solicitation registration",
    status: () => ({
      done: LEGAL_STATUS.fdacsRegistration !== null,
      detail:
        LEGAL_STATUS.fdacsRegistration !== null
          ? `Registration number: ${LEGAL_STATUS.fdacsRegistration}`
          : "Application in progress with the Florida Department of Agriculture and Consumer Services.",
    }),
  },
];

export default function TransparencyPage() {
  const legalLinks = [...legal].sort((a, b) => a.title.localeCompare(b.title));

  return (
    <main id="main">
      <PageHeader title={page.title} description={page.description} />
      <div className="bg-cream px-6 py-16 sm:py-20">
        <div className="mx-auto flex max-w-3xl flex-col gap-16">
          <Prose html={page.body} />

          <div className="border-t border-charcoal/15 pt-10">
            <h2 className="font-headline text-2xl text-charcoal sm:text-3xl">
              Current Filing Status
            </h2>
            <dl className="mt-6 flex flex-col gap-6">
              {FILINGS.map((filing) => {
                const { done, detail } = filing.status();
                return (
                  <div
                    key={filing.label}
                    className="flex flex-col gap-1 border-b border-charcoal/15 pb-6 last:border-b-0 last:pb-0"
                  >
                    <dt className="flex items-center gap-3 font-headline text-lg text-charcoal">
                      {filing.label}
                      <span className="font-body text-sm font-normal uppercase tracking-wide text-charcoal/60">
                        {done ? "Complete" : "In progress"}
                      </span>
                    </dt>
                    <dd className="font-body text-lg leading-relaxed text-charcoal">
                      {detail}
                    </dd>
                  </div>
                );
              })}
            </dl>
          </div>

          {legalLinks.length > 0 && (
            <div className="border-t border-charcoal/15 pt-10">
              <h2 className="font-headline text-2xl text-charcoal sm:text-3xl">
                Policies
              </h2>
              <ul className="mt-6 flex flex-col gap-2 font-body text-lg leading-relaxed">
                {legalLinks.map((legalPage) => (
                  <li key={legalPage.slug}>
                    <Link
                      href={`/legal/${legalPage.slug}`}
                      className="text-terracotta underline decoration-1 underline-offset-2 hover:text-terracotta-dark"
                    >
                      {legalPage.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="border-t border-charcoal/15 pt-10">
            <h2 className="font-headline text-2xl text-charcoal sm:text-3xl">
              Mailing Address
            </h2>
            <address className="mt-4 font-body text-lg not-italic leading-relaxed text-charcoal">
              {MINISTRY.name}
              <br />
              {MAILING_ADDRESS}
            </address>
          </div>
        </div>
      </div>
    </main>
  );
}
