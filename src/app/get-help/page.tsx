import { pages } from "#site/content";
import { ctaClassName } from "@/components/cta";
import { PageHeader } from "@/components/page-header";
import { Prose } from "@/components/prose";
import { buildMetadata } from "@/lib/metadata";
import { MINISTRY } from "@/lib/ministry";

function getPage() {
  const found = pages.find((p) => p.slug === "get-help");
  if (!found) throw new Error("Missing content/pages/get-help.md");
  return found;
}
const page = getPage();

export const metadata = buildMetadata({
  title: page.title,
  description: page.description,
  path: "/get-help",
});

export default function GetHelpPage() {
  return (
    <main id="main">
      <PageHeader title={page.title} description={page.description} />

      {/* Prominent phone CTA — this page serves people in crisis, so the
          number has to be impossible to miss and near the top, before any
          prose. */}
      <div className="bg-cream px-6 py-12 sm:py-16">
        <div className="mx-auto flex max-w-3xl flex-col items-start gap-4">
          <a href={MINISTRY.phone.tel} className={`${ctaClassName} text-xl`}>
            Call {MINISTRY.phone.display}
          </a>
        </div>
      </div>

      <div className="bg-cream px-6 pb-16 sm:pb-20">
        <Prose html={page.body} className="mx-auto max-w-3xl" />
      </div>

      {/* Pastoral care — the footer links here as /get-help#pastoral. */}
      <section id="pastoral" className="bg-ink px-6 py-20 sm:py-28">
        <div className="mx-auto flex max-w-3xl flex-col items-start gap-5">
          <h2 className="font-headline text-2xl text-cream sm:text-3xl">
            Pastoral Care
          </h2>
          <p className="text-pretty font-body text-lg leading-relaxed text-cream/90">
            Beyond financial help, {MINISTRY.founder.familiarName} offers
            pastoral care — prayer, counsel, and someone to talk to — available{" "}
            {MINISTRY.pastoralAvailability}, by call or appointment. If what you
            need right now is spiritual support rather than help with a bill,
            that call is just as welcome.
          </p>
          <a href={MINISTRY.phone.tel} className={ctaClassName}>
            Call {MINISTRY.phone.display}
          </a>
        </div>
      </section>
    </main>
  );
}
