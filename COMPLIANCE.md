# Compliance: what KOTHOM must file before it can collect donations

**This is not legal advice.** It is a working checklist so nothing gets missed, with links to the offices that actually decide each question. Before money changes hands, have a Florida nonprofit attorney or CPA review the plan. Fees and thresholds below were checked in **July 2026** and change — treat every dollar figure as "verify before paying."

This file is the **single home for the ministry's legal reasoning**. Code comments point here rather than repeating it, so Pastor T can read and correct this document without opening a source file.

---

## Where things stand today

As of 2026-07-21, **none of the four filings below are confirmed complete.** The website is built to be honest about that:

- No page claims donations are tax deductible.
- No page displays an EIN.
- No page displays a Florida charitable registration number.
- The two giving buttons open an email, not a payment form. **The site cannot currently take money**, which is what keeps the current state lawful while registration is pending.

That behaviour is controlled from one place — `LEGAL_STATUS` in `src/lib/ministry.ts`. Each value is empty until the corresponding filing is genuinely done. Filling one in switches the matching disclosure on across every page at once. **Do not fill one in early to "see how it looks."**

| Filing | Constant to set | Step below |
|---|---|---|
| Florida nonprofit corporation | `isFloridaNonprofitCorp` | Step 1 |
| Federal EIN | `ein` | Step 2 |
| IRS 501(c)(3) determination | `is501c3` | Step 3 |
| Florida charitable registration | `fdacsRegistration` | Step 4 |

---

## Step 1 — Incorporate as a Florida nonprofit corporation

**Who:** Florida Department of State, Division of Corporations ("Sunbiz").
**What:** Articles of Incorporation for a Florida Not For Profit Corporation.
**Cost:** roughly $70–$79 as of July 2026 — [verify on the Sunbiz fee schedule](https://dos.fl.gov/sunbiz/forms/fees/).
**File at:** <https://dos.fl.gov/sunbiz/start-business/efile/fl-nonprofit-corporation/>

**The trap:** the Articles must contain an IRS-compliant **purpose clause** and a **dissolution clause** (stating that on dissolution, assets go to another 501(c)(3) or to government for a public purpose). Generic incorporation templates frequently omit both. If they are missing, the IRS will reject the Step 3 application and the Articles have to be amended — paying twice and losing months. Get the Articles right the first time.

**Also required annually:** a Florida Annual Report, due by **May 1** each year. Missing it administratively dissolves the corporation.

---

## Step 2 — Get an EIN

**Who:** IRS. **What:** Form SS-4. **Cost:** free. **Time:** immediate online.

An EIN is required to open a bank account in the ministry's name and to apply for exemption. It is *not* the same thing as tax-exempt status, and having one confers no exemption. Once obtained, set `ein` in `src/lib/ministry.ts`.

---

## Step 3 — Apply for 501(c)(3) recognition

**Who:** IRS. **File at:** <https://www.irs.gov/instructions/i1023ez>

Two paths:

| | Form 1023-EZ | Form 1023 |
|---|---|---|
| Eligible if | projected gross receipts **≤ $50,000/yr** for three years **and** assets **< $250,000** | anyone |
| User fee | ~$275 | ~$600 |
| Typical decision | weeks | many months |

KOTHOM most likely qualifies for **1023-EZ** today. Two cautions worth raising with a CPA first: the EZ form is a self-certification with no supporting documents, so an organization that misjudges its eligibility can have exemption revoked retroactively; and if the ministry expects to grow past $50,000/yr soon, the full Form 1023 may be the steadier choice.

**Until the determination letter physically exists, the site must not say "tax deductible."** That is why `CAN_CLAIM_TAX_DEDUCTIBLE` is gated on `is501c3` and not on intent.

---

## Step 4 — Register to solicit contributions in Florida

**Who:** Florida Department of Agriculture and Consumer Services (FDACS).
**What:** Solicitation of Contributions registration (form FDACS-10100), **renewed annually**.
**Register at:** <https://www.fdacs.gov/business-services/solicitation-of-contributions>

This is the one most new ministries miss. It is **separate from** incorporation and **separate from** IRS exemption, and it is what actually grants permission to ask Floridians for money.

**Possible exemption:** an organization that raises **less than $50,000 a year** and whose fundraising is carried out entirely by **unpaid volunteers** may qualify to file the small-organization exemption (form FDACS-10110) instead of full registration. This likely fits KOTHOM today. Note it is an *application for exempt status*, not permission to skip filing — something still has to be sent in.

### The disclosure statement

Once registered, §496.411(3), Fla. Stat. requires this statement, **in capital letters**, together with the ministry's registration number, on every printed solicitation, written confirmation, receipt, or reminder of a contribution:

> A COPY OF THE OFFICIAL REGISTRATION AND FINANCIAL INFORMATION MAY BE OBTAINED FROM THE DIVISION OF CONSUMER SERVICES BY CALLING TOLL-FREE 1-800-HELP-FLA (435-7352) WITHIN THE STATE OR VISITING FDACS.GOV. REGISTRATION DOES NOT IMPLY ENDORSEMENT, APPROVAL, OR RECOMMENDATION BY THE STATE.

**On a website**, the statement is required on any page that shows a mailing address for contributions, shows a phone number for processing them, or processes them online — not on every page. Because this site's **footer** carries the mailing address and phone number on every page, the disclosure is placed in the footer, which satisfies the requirement everywhere at once.

It is built and ready in `src/components/fdacs-disclosure.tsx`, and renders nothing until `fdacsRegistration` is set. **The registration number must never be invented for display purposes.**

---

## The T-shirt problem

"Become a Knight" is a $25+ annual gift that includes a Knights of the Higher Order T-shirt. That one detail creates two separate problems, and they pull in different directions.

### 1. It reduces what the donor can deduct

A payment made partly as a gift and partly in exchange for goods is a **quid pro quo contribution**. The deductible amount is the payment *minus the fair market value of what the donor received* — so a $25 gift with a shirt worth $12 is a $13 deduction, not $25.

The IRS has an exception for benefits that are *insubstantial* (token items below an inflation-adjusted value, received for a payment above an inflation-adjusted minimum). **Confirm the current-year figures with a CPA** — a normal-quality T-shirt may well exceed the token threshold, in which case the ministry must tell donors in writing what portion is deductible.

**Three ways out, in rough order of simplicity:**
1. Make the shirt an **optional** add-on the donor can decline, and record the declination. A donor who declines deducts the full gift.
2. Source a shirt whose cost stays **under the current token threshold**, and keep the receipts proving it.
3. Keep the shirt and **print the deductible portion on every receipt**. Most work, most ongoing bookkeeping.

### 2. It may cost the ministry Stripe's nonprofit rate

Stripe's discounted nonprofit pricing requires that **more than 80% of payment volume be tax-deductible donations**. Stripe explicitly excludes **memberships**, tickets, tuition, registration fees, and auction payments. ([Stripe](https://support.stripe.com/questions/fee-discount-for-nonprofit-organizations))

"Become a Knight" is described throughout the site as a **membership**. If most giving arrives through it, the ministry could be disqualified from the discount and pay standard card rates on every gift.

**This is a decision for the ministry, not a coding task.** The cleanest resolution is probably to structure the ask as a **donation that carries recognition as a Knight**, rather than as a membership fee that buys a shirt — which is closer to what is actually happening anyway. Resolve it *before* Stripe onboarding, because how the ministry describes it in the application matters.

---

## Before switching on real payments

Do not wire up Stripe until all of the following are true:

- [ ] Steps 1–4 complete, all four constants set in `src/lib/ministry.ts`
- [ ] A bank account in the ministry's legal name, opened with the EIN
- [ ] The T-shirt question resolved (above) and reflected in the site's giving copy
- [ ] A published **refund/cancellation policy** — payment processors require one and will ask for the URL
- [ ] A published **privacy policy** and **terms of use**
- [ ] A working way for a recurring donor to **cancel without logging in** (today: `/membership` explains calling or emailing). Do not launch recurring giving without a cancellation path that a person can actually complete.
- [ ] A receipting process that states either "no goods or services were provided" or the deductible portion, per the T-shirt decision
- [x] **Security headers and a CSP** — enabled 2026-07-21, ahead of Stripe going live (see CLAUDE.md). Revisit the CSP's `script-src` if a real login/payment form needs stricter rules than the current no-nonce policy allows.
- [ ] The **real phone number** replacing the `689-123-4567` placeholder in `src/lib/ministry.ts`

---

## Annual upkeep, once running

| When | What | To whom |
|---|---|---|
| By May 1 | Florida Annual Report | Sunbiz |
| Annually | Renew charitable solicitation registration | FDACS |
| Annually | Form 990, 990-EZ, or 990-N | IRS |

Missing the 990 three years running causes **automatic revocation** of tax-exempt status. For a small ministry the 990-N ("e-Postcard") is usually all that's required, and it takes minutes — but it is not optional.

Public copies of these filings are what a donor, a bank, or a grantmaker looks for to believe an organization is real. The `/transparency` page exists to host them.
