"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { PRIMARY_NAV } from "@/lib/routes";

// The only client component in the header. It exists solely to mark the current
// section — everything else about the header renders on the server.
//
// There is deliberately no hamburger menu. With five links, mobile gets a
// wrapped row instead: PRODUCT.md's audience skews older and less tech-savvy,
// and /get-help serves people in an active crisis, so hiding the single most
// important link behind an icon that has to be discovered and tapped is the
// wrong trade for a couple of saved pixels.
//
// Colour choice, measured rather than eyeballed. On the ink surface:
//   terracotta        #764634  2.54:1  — fails, unusable as text on black
//   terracotta-swatch #a86a52  4.57:1  — clears AA, but only just
//   cream             #f4efe6 17.29:1
// So the link text stays cream in every state and the accent is carried by the
// underline instead. That keeps the text far above AA (PRODUCT.md asks to
// exceed it, not scrape past it), while still obeying DESIGN.md §5's "terracotta
// only on the active/hover state of links." An underline is a non-text
// element needing only 3:1, which 4.57:1 clears comfortably.
export function SiteNavLinks() {
  const pathname = usePathname();

  return (
    <ul className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 sm:justify-end">
      {PRIMARY_NAV.map((route) => {
        const isActive =
          pathname === route.href || pathname.startsWith(`${route.href}/`);

        return (
          <li key={route.href}>
            <Link
              href={route.href}
              aria-current={isActive ? "page" : undefined}
              className={`font-headline text-base tracking-wide text-cream underline-offset-8 decoration-terracotta-swatch transition-[text-decoration-color,text-decoration-thickness] hover:underline hover:decoration-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-tan-gold ${
                isActive ? "underline decoration-2" : ""
              }`}
            >
              {route.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
