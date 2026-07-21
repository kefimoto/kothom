// Shared visual treatment for the site's primary call-to-action buttons/links
// (terracotta background, cream text, sharp corners — see DESIGN.md's
// button-primary component). The elements that use this vary by purpose
// (an <a> for tel:/mailto:/hash links in page.tsx, a next/link <Link> for
// internal navigation, a <button> for the error page's retry action), so the
// className is the shared unit here rather than one polymorphic component.
export const ctaClassName =
  "inline-block rounded-none bg-terracotta px-8 py-3.5 font-headline text-base font-semibold tracking-wide text-cream transition-colors hover:bg-terracotta-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tan-gold";
