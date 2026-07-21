// The site's route table. Consumed by the header, the footer, and sitemap.ts,
// so a new page is added in exactly one place and cannot end up in the nav but
// missing from the sitemap (or the reverse).

export type Route = {
  href: string;
  label: string;
  /** Longer label for the footer, where there is room to be explicit. */
  footerLabel?: string;
};

/** Links in the header bar, in order. */
export const PRIMARY_NAV: Route[] = [
  { href: "/get-help", label: "Get Help" },
  { href: "/about", label: "About" },
  { href: "/give", label: "Give" },
  { href: "/news", label: "News" },
  { href: "/contact", label: "Contact" },
];

/** Grouped footer columns. Legal links are appended at render time from the
 *  `legal` content collection, so adding a legal markdown file is enough. */
export const FOOTER_NAV: { heading: string; links: Route[] }[] = [
  {
    heading: "Get Help",
    links: [
      { href: "/get-help", label: "Request Assistance" },
      { href: "/get-help#pastoral", label: "Pastoral Care" },
      { href: "/contact", label: "Contact Us" },
    ],
  },
  {
    heading: "Support the Ministry",
    links: [
      { href: "/give", label: "Ways to Give" },
      { href: "/give#become-a-knight", label: "Become a Knight" },
      { href: "/give#legacy", label: "Legacy Donations" },
      { href: "/membership", label: "Manage Your Membership" },
    ],
  },
  {
    heading: "About",
    links: [
      { href: "/about", label: "Our Story" },
      { href: "/transparency", label: "Transparency" },
      { href: "/news", label: "News & Updates" },
    ],
  },
];

/**
 * Routes that exist as real pages but are not generated from a content
 * collection. `/news/[slug]` and `/legal/[slug]` are enumerated separately in
 * sitemap.ts from Velite's output.
 */
export const STATIC_ROUTES: string[] = [
  "/",
  "/about",
  "/get-help",
  "/give",
  "/contact",
  "/transparency",
  "/membership",
  "/news",
];
