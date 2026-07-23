import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, test } from "vitest";
import { legal } from "#site/content";
import {
  CAN_ACCEPT_ONLINE_DONATIONS,
  CAN_CLAIM_TAX_DEDUCTIBLE,
  canAcceptOnlineDonations,
  LEGAL_STATUS,
  MINISTRY,
} from "../src/lib/ministry";
import { FOOTER_NAV, PRIMARY_NAV, STATIC_ROUTES } from "../src/lib/routes";

const APP_DIR = join(import.meta.dirname, "..", "src", "app");

describe("legal status gating", () => {
  /**
   * The rule COMPLIANCE.md exists to enforce: the site may only describe gifts
   * as tax deductible once an IRS determination letter actually exists. This
   * asserts the derivation rather than the current value, so it keeps holding
   * after the filings land.
   */
  test("tax-deductibility claims are gated on the IRS determination", () => {
    expect(CAN_CLAIM_TAX_DEDUCTIBLE).toBe(LEGAL_STATUS.is501c3);
  });

  test("online donation acceptance is gated on all four legal/tax conditions", () => {
    expect(CAN_ACCEPT_ONLINE_DONATIONS).toBe(
      canAcceptOnlineDonations(LEGAL_STATUS),
    );

    const validStatus = {
      is501c3: true,
      isFloridaNonprofitCorp: true,
      ein: "12-3456789",
      fdacsRegistration: "CH12345",
    };

    // True when all 4 are present
    expect(canAcceptOnlineDonations(validStatus)).toBe(true);

    // False when any of the 4 conditions is missing
    expect(canAcceptOnlineDonations({ ...validStatus, is501c3: false })).toBe(
      false,
    );
    expect(
      canAcceptOnlineDonations({
        ...validStatus,
        isFloridaNonprofitCorp: false,
      }),
    ).toBe(false);
    expect(canAcceptOnlineDonations({ ...validStatus, ein: null })).toBe(false);
    expect(canAcceptOnlineDonations({ ...validStatus, ein: "" })).toBe(false);
    expect(canAcceptOnlineDonations({ ...validStatus, ein: "   " })).toBe(
      false,
    );
    expect(
      canAcceptOnlineDonations({ ...validStatus, fdacsRegistration: null }),
    ).toBe(false);
    expect(
      canAcceptOnlineDonations({ ...validStatus, fdacsRegistration: "" }),
    ).toBe(false);
    expect(
      canAcceptOnlineDonations({ ...validStatus, fdacsRegistration: "   " }),
    ).toBe(false);
  });

  test("an EIN is never a placeholder string", () => {
    // Either genuinely absent, or a real 9-digit EIN. Never "TBD", "", or
    // "XX-XXXXXXX" — a fabricated identifier in structured data gets cached by
    // aggregators and is worse than none.
    if (LEGAL_STATUS.ein !== null) {
      expect(LEGAL_STATUS.ein).toMatch(/^\d{2}-\d{7}$/);
    }
  });

  test("a Florida registration number is never a placeholder string", () => {
    if (LEGAL_STATUS.fdacsRegistration !== null) {
      expect(LEGAL_STATUS.fdacsRegistration).toMatch(/^CH\d+$/);
    }
  });

  test("COMPLIANCE.md exists — the code comments point at it", () => {
    expect(existsSync(join(import.meta.dirname, "..", "COMPLIANCE.md"))).toBe(
      true,
    );
  });

  test("the placeholder phone number flag matches its placeholder state", () => {
    // Guards against the number being replaced without clearing the flag, or
    // the flag being cleared without replacing the number.
    if ((MINISTRY.phone.display as string) === "689-123-4567") {
      expect(MINISTRY.phone.isPlaceholder).toBe(true);
    } else {
      expect(MINISTRY.phone.isPlaceholder).toBe(false);
    }
  });
});

describe("route table", () => {
  const routeFileFor = (href: string) => {
    const path = href.split("#")[0];
    if (path === "/") return join(APP_DIR, "page.tsx");
    return join(APP_DIR, ...path.split("/").filter(Boolean), "page.tsx");
  };

  const navLinks = [
    ...PRIMARY_NAV.map((route) => route.href),
    ...FOOTER_NAV.flatMap((column) => column.links.map((link) => link.href)),
  ];

  // Catches the failure where a nav link is added before (or instead of) the
  // page it points at, which would ship a 404 straight from the header.
  test("every nav link resolves to a real page file", () => {
    const missing = navLinks.filter((href) => !existsSync(routeFileFor(href)));
    expect(missing, "nav links with no page.tsx").toEqual([]);
  });

  test("every static route resolves to a real page file", () => {
    const missing = STATIC_ROUTES.filter(
      (href) => !existsSync(routeFileFor(href)),
    );
    expect(missing, "STATIC_ROUTES entries with no page.tsx").toEqual([]);
  });

  // The reverse direction: a legal page that exists but is unreachable is dead
  // content. The footer builds its legal column from the collection, so this
  // asserts the collection is non-empty and every entry has a usable slug.
  test("every legal page has a linkable slug", () => {
    expect(legal.length).toBeGreaterThan(0);
    for (const page of legal) {
      expect(page.slug).toMatch(/^[a-z0-9-]+$/);
    }
  });
});
