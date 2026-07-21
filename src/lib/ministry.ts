// Single source of truth for every ministry fact that appears in more than one
// place. Before this existed, the phone number and email were string literals
// inside page.tsx; across a dozen pages that becomes grep-and-pray, and CLAUDE.md
// still lists "replace the placeholder phone number" as an open task.

export const SITE_URL = "https://kothoministries.org";

export const MINISTRY = {
  name: "Knights of the Higher Order Ministries",
  shortName: "KOTHOM",
  tagline: "Spreading His Word, One Family At A Time",

  founder: {
    name: "Pastor Andrew S. Trexler",
    familiarName: "Pastor T",
    title: "President and Founder",
  },

  // PLACEHOLDER. The source Canva deck carried two conflicting real numbers and
  // the client confirmed on 2026-07-20 that neither is currently correct.
  // Replacing it is now a one-line change here rather than a sitewide grep.
  phone: {
    display: "689-123-4567",
    tel: "tel:+16891234567",
    isPlaceholder: true,
  },

  email: "Knightsofthehigherorder@gmail.com",

  address: {
    street: "380 Lake Ontario Court",
    city: "Altamonte Springs",
    state: "FL",
    zip: "32701",
    country: "US",
  },

  officeHours: "Monday – Sunday: 10am – 5pm",
  pastoralAvailability: "24 hours a day, 7 days a week, 365 days a year",

  legacyDomain: "knightsofthehigherorderministries.org",
} as const;

export const MAILING_ADDRESS = `${MINISTRY.address.street}, ${MINISTRY.address.city}, ${MINISTRY.address.state} ${MINISTRY.address.zip}`;

/**
 * Legal and tax registration status. **This is the switchboard for every legal
 * disclosure on the site.**
 *
 * Every value is `null`/`false` until the corresponding filing is actually
 * complete and the number is in hand. That is load-bearing rather than a TODO
 * list: components read these directly and suppress their own UI while a value
 * is unset, so the site cannot print a fabricated EIN, cannot display an
 * invented Florida registration number, and cannot describe gifts as tax
 * deductible before that is true. Filling a value in is what turns the
 * corresponding disclosure on sitewide.
 *
 * What each filing is, who it goes to, what it costs, and what order they must
 * happen in is documented in **COMPLIANCE.md** — that file, not this one, is
 * the explanation. Update both together.
 */
export const LEGAL_STATUS = {
  /** IRS Employer Identification Number. COMPLIANCE.md § "Step 2". */
  ein: null as string | null,

  /** Florida FDACS registration ("CH12345"). COMPLIANCE.md § "Step 4". */
  fdacsRegistration: null as string | null,

  /** True once the IRS determination letter is in hand. COMPLIANCE.md § "Step 3". */
  is501c3: false,

  /** True once the corporation exists on Sunbiz. COMPLIANCE.md § "Step 1". */
  isFloridaNonprofitCorp: false,
} as const;

/**
 * Whether the site may describe gifts as tax deductible. Gated on the IRS
 * determination letter existing — not on intent, and not on incorporation.
 * COMPLIANCE.md § "What the site may and may not say today".
 */
export const CAN_CLAIM_TAX_DEDUCTIBLE: boolean = LEGAL_STATUS.is501c3;
