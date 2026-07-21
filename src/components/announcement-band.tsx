import type { Announcement } from "#site/content";
import { ctaClassName } from "@/components/cta";
import { Prose } from "@/components/prose";

/**
 * The band the ministry can switch on at the top of the homepage — a toy drive,
 * a service time change, a closure.
 *
 * Editing it means changing content/announcement.md and nothing else. See
 * CONTENT-GUIDE.md § "Putting an announcement on the front page".
 *
 * `active` is a manual boolean rather than an expiry date, and that is
 * deliberate. These pages are generated once at build time, so a page cannot
 * un-render itself when a date passes: an `expires` field would keep showing a
 * finished event until somebody happened to deploy again. A switch that has to
 * be flipped is honest about what the site can actually do.
 */
export function AnnouncementBand({
  announcement,
}: {
  announcement: Announcement;
}) {
  if (!announcement.active) return null;

  return (
    // Cream, and separated from the section below by a tan-gold rule rather
    // than a coloured side border: DESIGN.md §2 reserves terracotta for things
    // you can click (so it belongs on the CTA, not the container) and assigns
    // tan-gold to fine structural dividers, which is exactly this.
    <section
      aria-labelledby="announcement-title"
      className="border-b border-tan-gold/40 bg-cream px-6 py-12 sm:py-14"
    >
      <div className="mx-auto flex max-w-3xl flex-col items-start gap-4">
        <h2
          id="announcement-title"
          className="font-headline text-2xl text-charcoal sm:text-3xl"
        >
          {announcement.title}
        </h2>
        <Prose html={announcement.body} />
        {announcement.cta && (
          <a href={announcement.cta.href} className={ctaClassName}>
            {announcement.cta.label}
          </a>
        )}
      </div>
    </section>
  );
}
