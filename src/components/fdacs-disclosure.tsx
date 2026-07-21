import { LEGAL_STATUS } from "@/lib/ministry";

/**
 * The disclosure Florida requires of registered charitable organizations.
 *
 * What the law requires, when it applies, and why this sits in the footer is
 * documented in COMPLIANCE.md § "Florida: Solicitation of Contributions".
 * Keep the explanation there, not here — it is written to be reviewed by the
 * ministry, not by developers.
 *
 * Renders nothing while `fdacsRegistration` is null, because the statement is
 * only truthful once registration exists. Setting that constant in
 * ministry.ts turns the disclosure on sitewide.
 */
export function FdacsDisclosure() {
  if (LEGAL_STATUS.fdacsRegistration === null) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(
        "[compliance] FDACS disclosure is suppressed: LEGAL_STATUS.fdacsRegistration " +
          "is null in src/lib/ministry.ts. Florida registration must be completed " +
          "before this site solicits contributions. See COMPLIANCE.md.",
      );
    }
    return null;
  }

  return (
    // Florida requires this be displayed *conspicuously* and in capital
    // letters, so it sits at the same size as the copyright line rather than
    // shrinking to 12px fine print. cream/80 measures 11.04:1 on ink.
    <p className="max-w-[75ch] font-body text-sm uppercase leading-relaxed tracking-wide text-cream/80">
      A copy of the official registration and financial information may be
      obtained from the Division of Consumer Services by calling toll-free
      1-800-HELP-FLA (435-7352) within the state or visiting{" "}
      <a
        href="https://www.fdacs.gov"
        className="underline decoration-tan-gold/50 underline-offset-2 hover:text-cream"
      >
        FDACS.gov
      </a>
      . Registration does not imply endorsement, approval, or recommendation by
      the state. Registration number {LEGAL_STATUS.fdacsRegistration}.
    </p>
  );
}
