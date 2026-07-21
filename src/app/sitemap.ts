import type { MetadataRoute } from "next";
import { legal, news } from "#site/content";
import { SITE_URL } from "@/lib/ministry";
import { STATIC_ROUTES } from "@/lib/routes";

// Built from the same route table the header and footer read, plus the content
// collections, so a page cannot end up linked in the nav but missing from the
// sitemap — or generated as a route but never discoverable.

const absolute = (path: string) =>
  path === "/" ? SITE_URL : `${SITE_URL}${path}`;

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = STATIC_ROUTES.map((path) => ({
    url: absolute(path),
    lastModified: now,
    changeFrequency: "monthly",
    // The homepage is the entry point for both audiences; everything else sits
    // a step below it rather than being ranked against each other.
    priority: path === "/" ? 1 : 0.8,
  }));

  // Drafts have no route generated for them, so they must not be advertised
  // here either — otherwise the sitemap points crawlers at a 404.
  const newsPages: MetadataRoute.Sitemap = news
    .filter((post) => !post.draft)
    .map((post) => ({
      url: absolute(`/news/${post.slug}`),
      lastModified: new Date(post.date),
      changeFrequency: "yearly",
      priority: 0.6,
    }));

  const legalPages: MetadataRoute.Sitemap = legal.map((page) => ({
    url: absolute(`/legal/${page.slug}`),
    lastModified: new Date(page.lastUpdated),
    changeFrequency: "yearly",
    priority: 0.3,
  }));

  return [...staticPages, ...newsPages, ...legalPages];
}
