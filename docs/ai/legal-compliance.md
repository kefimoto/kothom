# Legal & compliance

**`COMPLIANCE.md` is the single home for the ministry's legal reasoning.** Code comments point at it rather than repeating it, because it's written to be read and corrected by the ministry, not by developers. If you're tempted to explain a statute in a TSX comment, put it in COMPLIANCE.md and link instead.

`LEGAL_STATUS` in `src/lib/ministry.ts` is the switchboard: every value is `null`/`false` until the corresponding filing is genuinely complete, and components suppress their own UI while unset. **Never fill one in to "see how it looks"** — that's what makes the site print a fabricated EIN or an invented Florida registration number. As of 2026-07-21 none of the four filings are confirmed, so no page may claim tax-deductibility.

## Known placeholders / not-yet-implemented

- **Phone number**: `689-327-6388`. It lives in **one place** — `MINISTRY.phone` in `src/lib/ministry.ts`. Markdown in `content/` spells it out in prose and can't import the constant, so `__tests__/content-integrity.test.ts` fails the build if any content file names a number that disagrees with it.
- **Payment processing is implemented but gated.** Stripe checkout is wired up and functional (`src/lib/stripe.ts`, `src/lib/actions.ts`, webhook handlers), but only enabled in preview/staging environments. In production, donations remain `mailto:`-only until the legal filings are complete and the feature flag is switched on (see `CAN_ACCEPT_ONLINE_DONATIONS` in `src/lib/ministry.ts`).
- **No auth.** `/membership` is a real, useful page explaining how to change or stop a gift by phone/email; it's where an account portal would attach later.
