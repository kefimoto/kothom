import { LEGAL_STATUS, MINISTRY, SITE_URL } from "@/lib/ministry";

/**
 * Schema.org structured data describing the ministry.
 *
 * PRODUCT.md notes that KOTHOM has no testimonials or press yet, so its
 * legitimacy rests on verifiable facts — a named pastor, a physical address, a
 * working phone. This is those same facts in the form search engines and
 * knowledge panels actually read.
 *
 * Every field is sourced from ministry.ts. Anything gated behind a filing that
 * has not happened (the EIN in particular) is omitted rather than guessed:
 * publishing a wrong identifier in structured data is worse than publishing
 * none, because aggregators cache it. See COMPLIANCE.md.
 */
export function OrganizationSchema() {
  const schema = {
    "@context": "https://schema.org",
    // NGO rather than the broader Organization: it is the type that actually
    // describes a charitable ministry, and it inherits everything below.
    "@type": "NGO",
    name: MINISTRY.name,
    alternateName: MINISTRY.shortName,
    url: SITE_URL,
    logo: `${SITE_URL}/kothom-mark.svg`,
    image: `${SITE_URL}/og-image.png`,
    slogan: MINISTRY.tagline,
    description:
      "A Christian ministry in Central Florida assisting single-parent families with utility bills, food, clothing, and housing, alongside pastoral care available at any hour.",
    founder: {
      "@type": "Person",
      name: MINISTRY.founder.name,
      jobTitle: MINISTRY.founder.title,
    },
    address: {
      "@type": "PostalAddress",
      streetAddress: MINISTRY.address.street,
      addressLocality: MINISTRY.address.city,
      addressRegion: MINISTRY.address.state,
      postalCode: MINISTRY.address.zip,
      addressCountry: MINISTRY.address.country,
    },
    email: MINISTRY.email,
    telephone: MINISTRY.phone.display,
    areaServed: {
      "@type": "AdministrativeArea",
      name: "Central Florida",
    },
    ...(LEGAL_STATUS.ein ? { taxID: LEGAL_STATUS.ein } : {}),
    ...(LEGAL_STATUS.is501c3
      ? { nonprofitStatus: "https://schema.org/Nonprofit501c3" }
      : {}),
  };

  return (
    <script
      type="application/ld+json"
      // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD built from local constants, no user input
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
