import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { legal } from "#site/content";
import { PageHeader } from "@/components/page-header";
import { Prose } from "@/components/prose";
import { buildMetadata } from "@/lib/metadata";

// Every legal page is one markdown file in content/legal/. Adding a new one —
// a cookie notice, a state-specific disclosure — means adding a file and
// nothing else: no route, no component, no TSX review.
//
// dynamicParams = false makes anything not enumerated below a 404 rather than
// an on-demand render, which is what keeps this a fully static site.
export const dynamicParams = false;

export function generateStaticParams() {
  return legal.map((page) => ({ slug: page.slug }));
}

function findPage(slug: string) {
  return legal.find((page) => page.slug === slug);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const page = findPage(slug);
  if (!page) return {};

  return buildMetadata({
    title: page.title,
    description: page.description,
    path: `/legal/${page.slug}`,
  });
}

export default async function LegalPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const page = findPage(slug);
  if (!page) notFound();

  const lastUpdated = new Date(page.lastUpdated);

  return (
    <main id="main">
      <PageHeader
        title={page.title}
        description={page.description}
        meta={
          <>
            Last updated{" "}
            <time dateTime={lastUpdated.toISOString().slice(0, 10)}>
              {lastUpdated.toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
                timeZone: "UTC",
              })}
            </time>
          </>
        }
      />
      <div className="bg-cream px-6 py-16 sm:py-20">
        <Prose html={page.body} className="mx-auto max-w-3xl" />
      </div>
    </main>
  );
}
