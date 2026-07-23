import { describe, expect, it } from "vitest";
import { buildMetadata } from "@/lib/metadata";
import { MINISTRY, SITE_URL } from "@/lib/ministry";

describe("buildMetadata", () => {
  it("generates correct metadata for standard pages", () => {
    const meta = buildMetadata({
      title: "Give",
      description: "Two ways to give.",
      path: "/give",
    });

    expect(meta.title).toBe("Give");
    expect(meta.description).toBe("Two ways to give.");
    expect(meta.alternates?.canonical).toBe("/give");

    const og = meta.openGraph as Record<string, unknown>;
    expect(og?.title).toBe("Give");
    expect(og?.description).toBe("Two ways to give.");
    expect(og?.url).toBe(`${SITE_URL}/give`);
    expect(og?.siteName).toBe(MINISTRY.name);
    expect(og?.type).toBe("website");
    expect(og?.images).toEqual([
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: MINISTRY.name,
      },
    ]);

    const tw = meta.twitter as Record<string, unknown>;
    expect(tw?.card).toBe("summary_large_image");
    expect(tw?.title).toBe("Give");
    expect(tw?.description).toBe("Two ways to give.");
    expect(tw?.images).toEqual(["/og-image.png"]);
  });

  it("supports article metadata for news posts", () => {
    const meta = buildMetadata({
      title: "News Post",
      description: "Article summary.",
      path: "/news/post-slug",
      type: "article",
      article: {
        publishedTime: "2026-07-22T00:00:00.000Z",
        authors: ["Pastor Andrew S. Trexler"],
      },
      image: {
        url: "https://example.com/cover.jpg",
        alt: "Cover Image",
      },
    });

    const og = meta.openGraph as Record<string, unknown>;
    expect(og.type).toBe("article");
    expect(og.publishedTime).toBe("2026-07-22T00:00:00.000Z");
    expect(og.authors).toEqual(["Pastor Andrew S. Trexler"]);
    expect(og.images).toEqual([
      {
        url: "https://example.com/cover.jpg",
        width: 1200,
        height: 630,
        alt: "Cover Image",
      },
    ]);

    const tw = meta.twitter;
    expect(tw?.images).toEqual(["https://example.com/cover.jpg"]);
  });
});
