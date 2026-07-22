import Link from "next/link";
import { legal } from "#site/content";
import { CrossMark } from "@/components/cross-mark";
import { FdacsDisclosure } from "@/components/fdacs-disclosure";
import { CAN_ACCEPT_ONLINE_DONATIONS, MINISTRY } from "@/lib/ministry";
import { FOOTER_NAV } from "@/lib/routes";

function ColumnHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-4 border-b border-tan-gold/40 pb-2 font-headline text-lg uppercase tracking-wide text-tan-gold">
      {children}
    </h2>
  );
}

const linkClassName =
  "underline decoration-tan-gold/50 underline-offset-2 hover:text-cream focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tan-gold";

// Previously this lived inside page.tsx — and inside <main>, which is an
// accessibility defect (a site footer is a sibling of the main landmark, not a
// descendant of it). Moving it into the root layout both fixes that and stops
// every new page from having to re-declare the contact block.
export function SiteFooter() {
  // Legal pages are enumerated from the content collection rather than a
  // hardcoded list, so adding content/legal/foo.md is enough to get it linked.
  const legalLinks = [...legal].sort((a, b) => a.title.localeCompare(b.title));

  return (
    <footer id="contact" className="bg-ink px-6 py-20 sm:py-24">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-14">
        <CrossMark size="small" />

        <div className="grid w-full gap-12 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <ColumnHeading>Contact Us</ColumnHeading>
            <address className="flex flex-col gap-1 font-body text-base not-italic leading-relaxed text-cream/90">
              <span>{MINISTRY.founder.title}</span>
              <span>
                {MINISTRY.founder.name} ({MINISTRY.founder.familiarName})
              </span>
              <span className="mt-2">{MINISTRY.address.street}</span>
              <span>
                {MINISTRY.address.city}, {MINISTRY.address.state}{" "}
                {MINISTRY.address.zip}
              </span>
              <a href={MINISTRY.phone.tel} className={`mt-2 ${linkClassName}`}>
                {MINISTRY.phone.display}
              </a>
              <a href={`mailto:${MINISTRY.email}`} className={linkClassName}>
                {MINISTRY.email}
              </a>
            </address>
            <p className="mt-4 font-body text-base leading-relaxed text-cream/90">
              <span className="block text-cream">Office Hours</span>
              {MINISTRY.officeHours}
            </p>
          </div>

          {FOOTER_NAV.map((column) => (
            <div key={column.heading}>
              <ColumnHeading>{column.heading}</ColumnHeading>
              <ul className="flex flex-col gap-2 font-body text-base leading-relaxed text-cream/90">
                {column.links.map((route) => {
                  const isGiveLink = route.href.startsWith("/give");
                  const targetHref =
                    isGiveLink && !CAN_ACCEPT_ONLINE_DONATIONS
                      ? `mailto:${MINISTRY.email}?subject=${encodeURIComponent(route.footerLabel ?? route.label)}`
                      : route.href;

                  return (
                    <li key={route.href}>
                      <Link href={targetHref} className={linkClassName}>
                        {route.footerLabel ?? route.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>

        {legalLinks.length > 0 && (
          <nav
            aria-label="Legal"
            className="w-full border-t border-tan-gold/25 pt-8"
          >
            <ul className="flex flex-wrap justify-center gap-x-6 gap-y-2 font-body text-sm text-cream/80">
              {legalLinks.map((page) => (
                <li key={page.slug}>
                  <Link href={`/legal/${page.slug}`} className={linkClassName}>
                    {page.title}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        )}

        <FdacsDisclosure />

        <p className="font-body text-sm text-cream/60">
          &copy; {new Date().getFullYear()} {MINISTRY.name}
        </p>
      </div>
    </footer>
  );
}
