---
name: KOTHOM
description: Knights of the Higher Order Ministries — spreading His word, one family at a time.
colors:
  ink-black: "#0a0a0a"
  cream: "#f4efe6"
  silver-emboss: "#c9c9c9"
  terracotta: "#764634"
  terracotta-swatch: "#a86a52"
  tan-gold: "#c9a876"
  charcoal-body: "#2a2a2a"
typography:
  display:
    fontFamily: "'Cinzel Decorative', 'Cinzel', Georgia, serif"
    fontSize: "clamp(2.25rem, 6vw, 4rem)"
    fontWeight: 700
    lineHeight: 1.05
    letterSpacing: "0.01em"
  headline:
    fontFamily: "'Cinzel', Georgia, serif"
    fontSize: "clamp(1.75rem, 4vw, 2.75rem)"
    fontWeight: 600
    lineHeight: 1.1
  body:
    fontFamily: "'PT Serif', Georgia, serif"
    fontSize: "1.125rem"
    fontWeight: 400
    lineHeight: 1.6
  proseH2:
    fontFamily: "'Cinzel', Georgia, serif"
    fontSize: "1.75rem"
    fontWeight: 600
    lineHeight: 1.1
  proseH3:
    fontFamily: "'Cinzel', Georgia, serif"
    fontSize: "1.375rem"
    fontWeight: 600
    lineHeight: 1.1
rounded:
  none: "0px"
components:
  button-primary:
    backgroundColor: "{colors.terracotta}"
    textColor: "{colors.cream}"
    rounded: "{rounded.none}"
    padding: "14px 32px"
  button-primary-hover:
    backgroundColor: "#5a3627"
---

# Design System: KOTHOM

## 1. Overview

**Creative North Star: "The Order's Seal"**

KOTHOM's existing materials — a radiant white cross on black, inscription-style capital lettering, a black-and-cream duotone — already read like the seal of a chivalric order: solemn, legible, unhurried, built to be trusted by an older, church-going audience rather than to impress a design crowd. This is an existing identity captured from the ministry's own Canva deck, not a new system invented for the web; the job here is preservation and faithful translation, not reinvention. The system explicitly rejects the **generic SaaS/startup landing page** (gradient text, glassmorphism, hero-metric templates, tiny uppercase eyebrows) and the **flashy prosperity-gospel megachurch look** (loud stock photography, autoplay video, aggressive donate popups) — this identity is dignified and text-forward, closer to a printed program than an app.

**Key Characteristics:**
- Black-and-cream duotone: dark slides (hero, contact/footer) and light cream slides (mission, services) alternate, never mixed on one surface
- One warm terracotta accent for actionable buttons; a secondary muted tan-gold for footer labels and dividers
- Inscription-style capital display type (Cinzel Decorative for the wordmark, Cinzel for section headlines) paired with a warm, highly legible serif body
- A single signature mark — the radiant cross — anchors the hero and footer

## 2. Colors

A black-and-cream duotone carries the whole system; one warm terracotta accent marks every actionable moment, and a muted tan-gold marks quieter structural labels.

### Primary
- **Terracotta** (`#764634`): The color of every actionable button and caption bar (Pastoral Services, Donations/Support, Learn More, Join the Ranks). Reserved for things a visitor can click. Darkened from the deck's approximate source swatch (`#a86a52`, kept as `terracotta-swatch` for reference) specifically so cream text sitting on it clears 4.5:1 contrast (6.8:1 measured) — PRODUCT.md calls for exceeding AA, not just clearing it, given the older audience, and the lighter swatch only measured 3.78:1 with cream text at button/caption-bar text sizes. Accessibility won over the literal extracted value here; the hue and character are unchanged, only the lightness step.

### Secondary
- **Tan-Gold** (`#c9a876`, approximate): Footer section labels ("Contact Us," "Ministry Official Office Hours") and fine dividers. Quieter than terracotta — structural, not actionable.

### Neutral
- **Ink Black** (`#0a0a0a`): Hero and footer/contact surfaces. Full-bleed black, not a dark gray.
- **Cream** (`#f4efe6`): Mission, services, and "How You Can Help" surfaces. A true warm off-white already established by the brand's own materials — identity preservation overrides the general caution against default cream backgrounds, because this cream is a deliberate, pre-existing brand choice, not a reflexive AI default.
- **Silver-Emboss** (`#c9c9c9`): The embossed/outlined effect on display headings over both black and cream surfaces. On the web, simplify the literal bevel/emboss to a solid fill with a subtle single-direction text-shadow rather than reproducing Canva's 3D effect literally.
- **Charcoal Body** (`#2a2a2a`): Body copy on cream surfaces. Never a washed-out light gray — this audience needs strong contrast.

### Named Rules
**The Duotone Rule.** A given section is either black or cream, never a gradient or blend between them. Alternate section-by-section down the page for rhythm.
**The One Accent Rule.** Terracotta appears only on things a visitor can click. If it's not a button or a link, it isn't terracotta.

## 3. Typography

**Display Font:** Cinzel Decorative (with Georgia, serif fallback) — free, Google Fonts, OFL-licensed.
**Headline Font:** Cinzel (with Georgia, serif fallback) — the non-decorative sibling of the display face; a deliberate free substitute for the deck's original Augustea Open, which is a commercial font not licensed for this build yet.
**Body Font:** PT Serif (with Georgia, serif fallback) — free, Google Fonts, a workhorse text serif built for extended reading with a large x-height, chosen over more fashionable AI-era picks (Lora, Fraunces, Crimson) specifically for legibility at larger sizes for an older audience.

**Character:** Two weights of the same Roman-inscription lineage (Cinzel Decorative, Cinzel) carry the ceremonial, order-like voice in headlines; PT Serif underneath keeps long-form mission copy sturdy and easy to read rather than precious.

### Hierarchy
- **Display** (700, `clamp(2.25rem, 6vw, 4rem)`, 1.05): The wordmark and hero tagline ("Spreading His Word, One Family At A Time") only.
- **Headline** (600, `clamp(1.75rem, 4vw, 2.75rem)`, 1.1): Section titles (A Ministry Built On Salvation..., How You Can Help).
- **Body** (400, 1.125rem, 1.6): Mission prose, service descriptions. Cap line length at 65–75ch; never smaller than 18px base given the audience.
- **Label** (600, 1rem, uppercase optional): Button and caption-bar text (Learn More, Join the Ranks, Pastoral Services).

#### Long-form prose steps (added 2026-07-21)

The ramp above was written for a single landing page, where the only headings are full-width section titles. Markdown-authored pages (news posts, legal pages, `/about`) need intermediate steps between the Headline clamp and Body. These are Cinzel at weight 600, and they are the **only** additional sizes permitted — anything else is drift:

- **Prose H2** (`1.75rem`): the lower bound of the Headline clamp, reused rather than invented. The largest heading allowed *inside* a prose body.
- **Prose H3** (`1.375rem`): 22px — one step down, a major-third-ish interval from Body.
- **Prose H4**: no new size. Reuses the **Label** treatment (uppercase, tracked) at Body size.

Table cells inside prose take the Body size, not a step down — the 18px floor is an accessibility rule for this audience, and it applies to tabular data too.

### Named Rules
**The Legibility-First Rule.** Any typographic decision that trades readability for ornament is wrong for this audience. The decorative display face is reserved for short headline moments only — never body copy, never more than one line where avoidable.

## 4. Elevation

Flat by default, matching the source materials exactly: no shadows, no glass, no layered cards. Depth comes from full-bleed color blocks (black section against cream section) rather than elevation. Caption bars sit as flat, flush-edged color blocks directly under their images — not floating cards with shadows.

### Named Rules
**The Flat-By-Default Rule.** Surfaces are flat at rest. The only depth signal is the alternating black/cream duotone itself.

## 5. Components

### Buttons / Caption Bars
- **Shape:** Sharp corners (0px radius) — the source deck uses no rounding anywhere.
- **Primary:** Terracotta background, cream text, generous padding (14px 32px), used as flush caption bars under images (Pastoral Services, Donations/Support) and as bordered text buttons on photos (Learn More, Join the Ranks).
- **Hover/Focus:** Darken terracotta toward `#5a3627`; add a visible focus outline in tan-gold for keyboard users (measured 3.47:1 against the terracotta background, clearing the 3:1 focus-indicator guideline).

### Cards / Image Panels
- **Corner Style:** Sharp (0px).
- **Background:** The photograph itself; no surrounding card chrome.
- **Shadow Strategy:** None — see Elevation.
- **Caption Placement:** A flush, full-width terracotta or bordered-white bar anchored to the bottom edge of the image, never floating or offset.

### The Radiant Cross Mark
A glowing white cross with radiating light rays on a black ground, with the wordmark arced above it and "Ministries" set below. This is the signature component: it anchors the hero at the top of the page and repeats in the footer/contact section. Do not simplify it into a flat icon — the glow/radiance is core to the mark's identity.

### Navigation
Built 2026-07-21 (`src/components/site-header.tsx`), following the constraints previously sketched here: flat, no elevation, always ink — every page opens on an ink band, so the bar reads as part of it — and never a terracotta background bar.

**No hamburger menu.** With five links, mobile gets a wrapped row instead. PRODUCT.md's audience skews older and less tech-savvy, and `/get-help` serves people in an active crisis; hiding the most important link behind an icon that has to be discovered and tapped is the wrong trade. It also keeps the header free of client-side JS apart from the current-page marker.

**Accent on ink is `terracotta-swatch`, never `terracotta`.** Measured against ink black `#0a0a0a`:

| | ratio | usable as text on ink |
|---|---|---|
| `terracotta` `#764634` | 2.54:1 | no |
| `terracotta-swatch` `#a86a52` | 4.57:1 | yes, but only just clears AA |
| `tan-gold` `#c9a876` | 8.81:1 | yes |
| `cream` `#f4efe6` | 17.29:1 | yes |

The darkening that produced `terracotta` was for *cream text on a terracotta background*; the reverse situation — terracotta as text on ink — is where it fails. In the header the link text therefore stays cream in every state and the accent is carried by the **underline** instead: text never drops below 17.29:1 (PRODUCT.md asks to exceed AA, not scrape past it), while an underline is a non-text element needing only 3:1.

### Long-form prose
`.prose-kothom` in `globals.css` styles markdown bodies compiled by Velite. Hand-written rather than `@tailwindcss/typography`, which ships opinions this system rejects (rounded corners, its own type scale and link colors) — adopting it would mean a dependency plus overriding most of it. Prose renders on cream surfaces only; it is never set on an ink section.

## 6. Do's and Don'ts

### Do:
- **Do** alternate full-bleed black and cream sections down the page (The Duotone Rule).
- **Do** reserve terracotta strictly for clickable elements (The One Accent Rule).
- **Do** use Cinzel Decorative only for the wordmark/hero tagline; Cinzel for section headlines; PT Serif for all body copy.
- **Do** keep every corner sharp (0px radius) — cards, buttons, images, all of it.
- **Do** surface the founder's name, address, and phone number prominently as legitimacy proof, not buried in fine print.

### Don't:
- **Don't** use gradient text or `background-clip: text` effects.
- **Don't** use glassmorphism, drop shadows, or floating cards — this system is flat by doctrine.
- **Don't** build a hero-metric template (big number + small label + gradient accent) — this is a ministry, not a SaaS product.
- **Don't** add tiny uppercase tracked eyebrows above every section.
- **Don't** use loud stock photography, autoplay video backgrounds, or aggressive donate popups.
- **Don't** round any corners — the source identity is sharp-cornered throughout.
- **Don't** substitute a lighter or more saturated cream for the established `#f4efe6` — it's a deliberate brand choice, not a placeholder.
