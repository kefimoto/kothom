import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { news } from "#site/content";
import { PageHeader } from "@/components/page-header";
import { Prose } from "@/components/prose";
import { buildMetadata } from "@/lib/metadata";

// Mirrors src/app/legal/[slug]/page.tsx. dynamicParams = false makes anything
// not enumerated below a 404 rather than an on-demand render, which is what
// keeps this a fully static site — and, combined with excluding drafts from
// generateStaticParams below, is what actually enforces "an unpublished post
// gets no URL at all" rather than just hiding it from the index.
export const dynamicParams = false;

export function generateStaticParams() {
  return news
    .filter((post) => !post.draft)
    .map((post) => ({ slug: post.slug }));
}

// Also re-checks `!post.draft` here, not just in generateStaticParams. Without
// that, a draft slug would 404 at build time (correct) but a stale/prerendered
// path or a future change to dynamicParams could otherwise resolve it — this
// keeps "drafts are unreachable" a property of the lookup itself.
function findPost(slug: string) {
  const post = news.find((p) => p.slug === slug);
  return post && !post.draft ? post : undefined;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = findPost(slug);
  if (!post) return {};

  return buildMetadata({
    title: post.title,
    description: post.summary,
    path: `/news/${post.slug}`,
    type: "article",
    article: {
      publishedTime: post.date,
      authors: post.author ? [post.author] : undefined,
    },
    image: post.cover ? { url: post.cover.src, alt: post.title } : undefined,
  });
}

export default async function NewsPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = findPost(slug);
  if (!post) notFound();

  const date = new Date(post.date);

  return (
    <main id="main">
      <PageHeader
        title={post.title}
        description={post.summary}
        meta={
          <>
            <time dateTime={date.toISOString().slice(0, 10)}>
              {date.toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
                timeZone: "UTC",
              })}
            </time>
            {post.author && <> · {post.author}</>}
          </>
        }
      />
      <div className="bg-cream px-6 py-16 sm:py-20">
        <div className="mx-auto flex max-w-3xl flex-col gap-10">
          {post.cover && (
            <Image
              src={post.cover.src}
              width={post.cover.width}
              height={post.cover.height}
              placeholder={post.cover.blurDataURL ? "blur" : undefined}
              blurDataURL={post.cover.blurDataURL}
              alt=""
              className="block w-full"
            />
          )}
          <Prose html={post.body} />
          <Link
            href="/news"
            className="font-body text-lg text-terracotta underline underline-offset-2 hover:text-terracotta-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terracotta"
          >
            ← All news
          </Link>
        </div>
      </div>
    </main>
  );
}
