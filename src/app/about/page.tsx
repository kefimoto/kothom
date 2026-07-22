import { pages } from "#site/content";
import { PageHeader } from "@/components/page-header";
import { Prose } from "@/components/prose";
import { buildMetadata } from "@/lib/metadata";
import { MINISTRY } from "@/lib/ministry";

function getAboutPage() {
  const found = pages.find((p) => p.slug === "about");
  if (!found) throw new Error("Missing content/pages/about.md");
  return found;
}
const page = getAboutPage();

export const metadata = buildMetadata({
  title: page.title,
  description: page.description,
  path: "/about",
});

export default function AboutPage() {
  return (
    <main id="main">
      <PageHeader title={page.title} description={page.description} />
      <div className="bg-cream px-6 py-16 sm:py-20">
        <div className="mx-auto flex max-w-3xl flex-col gap-16">
          <Prose html={page.body} />

          <div className="border-t border-charcoal/15 pt-10">
            <h2 className="font-headline text-2xl text-charcoal sm:text-3xl">
              Ministry Leadership
            </h2>
            <p className="mt-3 font-body text-lg leading-relaxed text-charcoal">
              <span className="block font-headline text-xl text-charcoal">
                {MINISTRY.founder.name}
              </span>
              {MINISTRY.founder.title}
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
