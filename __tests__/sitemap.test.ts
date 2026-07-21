import { describe, expect, test } from "vitest";
import { legal, news } from "#site/content";
import sitemap from "../src/app/sitemap";
import { SITE_URL } from "../src/lib/ministry";
import { STATIC_ROUTES } from "../src/lib/routes";

describe("sitemap", () => {
  const entries = sitemap();
  const urls = entries.map((entry) => entry.url);

  test("lists the production homepage at top priority", () => {
    expect(entries[0]).toMatchObject({
      url: SITE_URL,
      changeFrequency: "monthly",
      priority: 1,
    });
    expect(entries[0].lastModified).toBeInstanceOf(Date);
  });

  test("includes every static route", () => {
    for (const path of STATIC_ROUTES) {
      const expected = path === "/" ? SITE_URL : `${SITE_URL}${path}`;
      expect(urls).toContain(expected);
    }
  });

  test("includes every legal page from the content collection", () => {
    expect(legal.length).toBeGreaterThan(0);
    for (const page of legal) {
      expect(urls).toContain(`${SITE_URL}/legal/${page.slug}`);
    }
  });

  // The counterpart to generateStaticParams filtering drafts: a draft in the
  // sitemap would point crawlers at a URL that 404s, because no route is
  // generated for it.
  test("advertises published news posts and never drafts", () => {
    for (const post of news) {
      const url = `${SITE_URL}/news/${post.slug}`;
      if (post.draft) {
        expect(urls).not.toContain(url);
      } else {
        expect(urls).toContain(url);
      }
    }
  });

  test("every url is absolute, on the production domain, and unique", () => {
    for (const url of urls) {
      expect(url.startsWith(SITE_URL)).toBe(true);
      // CLAUDE.md: customer-facing URLs must never be the vercel.app alias.
      expect(url).not.toContain("vercel.app");
    }
    expect(new Set(urls).size).toBe(urls.length);
  });
});
