import type { Metadata } from "next";
import { MINISTRY, SITE_URL } from "@/lib/ministry";

// Next.js metadata is *shallowly* merged per route segment: a page that
// doesn't export its own `openGraph`/`twitter` object inherits the parent's
// wholesale, not field-by-field (see generate-metadata.md § Merging). Before
// this helper existed, every page except /news/[slug] only set `title` and
// `description`, so their og:title, og:description, and og:url all silently
// fell back to the homepage's values from the root layout — sharing any page
// but home showed the wrong URL and generic copy. Routing every page through
// this one function makes that class of bug structurally impossible: there's
// no path to a `title`/`description` without a matching openGraph/twitter.
type PageMetadataInput = {
  title: string;
  description: string;
  path: string;
  type?: "website" | "article";
  image?: { url: string; alt?: string };
  article?: {
    publishedTime?: string;
    modifiedTime?: string;
    authors?: string[];
  };
};

export function buildMetadata({
  title,
  description,
  path,
  type = "website",
  image,
  article,
}: PageMetadataInput): Metadata {
  const url = `${SITE_URL}${path}`;
  const ogImage = image ?? { url: "/og-image.png", alt: MINISTRY.name };

  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title,
      description,
      url,
      type,
      siteName: MINISTRY.name,
      images: [
        {
          url: ogImage.url,
          width: 1200,
          height: 630,
          alt: ogImage.alt ?? title,
        },
      ],
      ...(type === "article" ? article : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage.url],
    },
  };
}
