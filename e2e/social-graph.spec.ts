import { expect, test } from "@playwright/test";

test.describe("Social Graph (OpenGraph & Twitter Card) metadata", () => {
  test("homepage contains root OpenGraph and Twitter tags", async ({
    page,
  }) => {
    await page.goto("/");

    const ogTitle = await page.getAttribute(
      'meta[property="og:title"]',
      "content",
    );
    const ogUrl = await page.getAttribute('meta[property="og:url"]', "content");
    const ogSiteName = await page.getAttribute(
      'meta[property="og:site_name"]',
      "content",
    );
    const twitterCard = await page.getAttribute(
      'meta[name="twitter:card"]',
      "content",
    );

    expect(ogTitle).toBe("Knights of the Higher Order Ministries");
    expect(ogUrl).toBe("https://kothoministries.org");
    expect(ogSiteName).toBe("Knights of the Higher Order Ministries");
    expect(twitterCard).toBe("summary_large_image");
  });

  test("interior pages render page-specific og:url, og:title, and og:description", async ({
    page,
  }) => {
    await page.goto("/give");

    const title = await page.title();
    const ogTitle = await page.getAttribute(
      'meta[property="og:title"]',
      "content",
    );
    const ogDescription = await page.getAttribute(
      'meta[property="og:description"]',
      "content",
    );
    const ogUrl = await page.getAttribute('meta[property="og:url"]', "content");
    const canonical = await page.getAttribute('link[rel="canonical"]', "href");

    expect(title).toBe("Give | Knights of the Higher Order Ministries");
    expect(ogTitle).toBe("Give");
    expect(ogDescription).toContain("Two ways to give");
    expect(ogUrl).toBe("https://kothoministries.org/give");
    expect(canonical).toBe("https://kothoministries.org/give");
  });

  test("news article includes article og:type, published_time, and author", async ({
    page,
  }) => {
    await page.goto("/news/welcome");

    const ogType = await page.getAttribute(
      'meta[property="og:type"]',
      "content",
    );
    const ogUrl = await page.getAttribute('meta[property="og:url"]', "content");
    const articlePublishedTime = await page.getAttribute(
      'meta[property="article:published_time"]',
      "content",
    );
    const articleAuthor = await page.getAttribute(
      'meta[property="article:author"]',
      "content",
    );

    expect(ogType).toBe("article");
    expect(ogUrl).toBe("https://kothoministries.org/news/welcome");
    expect(articlePublishedTime).toBeTruthy();
    expect(articleAuthor).toBe("Pastor Andrew S. Trexler");
  });
});
