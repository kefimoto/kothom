import Link from "next/link";
import { SiteNavLinks } from "@/components/site-nav-links";
import { MINISTRY } from "@/lib/ministry";

// DESIGN.md §5 left navigation undefined ("not yet established in the source
// materials"). The constraints it did set are followed here: flat, no elevation,
// matching the surface it sits over (always ink — every page opens on an ink
// band, so the header reads as part of it), and never a terracotta background
// bar. The accent appears only on link hover/active, in the underline.
export function SiteHeader() {
  return (
    <header className="bg-ink px-6 py-4">
      <nav
        aria-label="Main"
        className="mx-auto flex max-w-5xl flex-col items-center gap-4 sm:flex-row sm:justify-between"
      >
        {/* Wordmark only — the radiant cross seal is deliberately not repeated
            here. DESIGN.md §5 says the mark must not be simplified into a flat
            icon because the glow is core to its identity, and at header size
            that is exactly what happens: the arced wordmark inside it collapses
            into an illegible smudge that reads as a broken image. The full seal
            already appears at proper size in the homepage hero and in the
            footer of every page, so nothing is lost by leaving it out of the
            bar. See CROSS-MARK.md. */}
        <Link
          href="/"
          className="focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-tan-gold"
        >
          <span
            aria-hidden="true"
            className="block font-headline text-base uppercase leading-tight tracking-[0.08em] text-cream sm:text-lg"
          >
            Knights of the
            <br />
            Higher Order
          </span>
          <span className="sr-only">{MINISTRY.name} — home</span>
        </Link>

        <SiteNavLinks />
      </nav>
    </header>
  );
}
