import Image from "next/image";
import Link from "next/link";
import { news } from "#site/content";
import { PageHeader } from "@/components/page-header";
import { buildMetadata } from "@/lib/metadata";

export const metadata = buildMetadata({
  title: "News & Updates",
  description:
    "Stories and updates from Knights of the Higher Order Ministries — what's happening in the community and with the families we serve.",
  path: "/news",
});

export default function NewsIndexPage() {
  // Draft posts get no page (see the [slug] route's generateStaticParams),
  // but they still exist in the Velite collection, so the index has to filter
  // them out itself too — otherwise a draft would show up here linking to a
  // 404.
  const posts = news
    .filter((post) => !post.draft)
    .sort((a, b) => (a.date < b.date ? 1 : -1));

  return (
    <main id="main">
      <PageHeader
        title="News & Updates"
        description="Stories from the work Knights of the Higher Order Ministries is doing with single-parent families in Central Florida, and updates from Pastor T."
      />
      <div className="bg-cream px-6 py-16 sm:py-20">
        <div className="mx-auto max-w-3xl">
          {posts.length === 0 ? (
            <p className="max-w-[70ch] text-pretty font-body text-lg leading-relaxed text-charcoal">
              There&apos;s nothing posted here yet. Check back soon — or if
              you&apos;re looking for the latest from the ministry right now,{" "}
              <Link
                href="/contact"
                className="text-terracotta underline underline-offset-2 hover:text-terracotta-dark"
              >
                reach out directly
              </Link>
              .
            </p>
          ) : (
            <div className="flex flex-col gap-14">
              {posts.map((post) => {
                const date = new Date(post.date);
                return (
                  <article key={post.slug} className="flex flex-col gap-4">
                    {post.cover && (
                      <Link href={`/news/${post.slug}`} className="block">
                        <Image
                          src={post.cover.src}
                          width={post.cover.width}
                          height={post.cover.height}
                          placeholder={
                            post.cover.blurDataURL ? "blur" : undefined
                          }
                          blurDataURL={post.cover.blurDataURL}
                          alt=""
                          className="block w-full"
                        />
                      </Link>
                    )}
                    <p className="font-body text-base text-charcoal/70">
                      <time dateTime={date.toISOString().slice(0, 10)}>
                        {date.toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          timeZone: "UTC",
                        })}
                      </time>
                      {post.author && <> · {post.author}</>}
                    </p>
                    <h2 className="font-headline text-2xl text-charcoal sm:text-3xl">
                      <Link
                        href={`/news/${post.slug}`}
                        className="text-charcoal underline decoration-transparent underline-offset-4 transition-colors hover:text-terracotta hover:decoration-terracotta focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terracotta"
                      >
                        {post.title}
                      </Link>
                    </h2>
                    <p className="max-w-[70ch] text-pretty font-body text-lg leading-relaxed text-charcoal">
                      {post.summary}
                    </p>
                    <Link
                      href={`/news/${post.slug}`}
                      className="font-body text-lg text-terracotta underline underline-offset-2 hover:text-terracotta-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terracotta"
                    >
                      Read more →
                    </Link>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
