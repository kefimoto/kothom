@AGENTS.md

## Design Context

This project has `PRODUCT.md` (strategy: audiences, mission, giving paths, brand personality) and `DESIGN.md` (visual system: colors, typography, components) at the project root, generated and maintained by the `impeccable` skill. Read both before making UI/design decisions — `DESIGN.md` wins on visual choices, `PRODUCT.md` wins on strategic/voice choices. The visual identity (black-and-cream duotone, terracotta accent, Cinzel/Cinzel Decorative + PT Serif typography, the radiant cross mark) is sourced from the ministry's existing Canva materials (`.impeccable/assets/`) — preserve it rather than redesigning from scratch.

## Reliability principles

This site should keep working untouched for years with no maintenance. Concretely:

- **No runtime dependency on external services for core functionality.** Don't hotlink images or other assets from third-party CDNs (e.g. `images.unsplash.com`) — download and self-host them in `public/` instead (see `.impeccable/assets/image-credits.md` for sourcing/licensing records). If a third-party service goes down or changes its API, the site should be unaffected.
- Apply this same standard to future dependencies: prefer self-contained, self-hosted solutions over ones that assume an always-available external service, unless the feature genuinely requires live external data (e.g. Stripe for payments).

## Known placeholders / not-yet-implemented

- **Phone number is a placeholder**: `689-123-4567` appears throughout the site (hero, footer, Pastoral Services). The source Canva deck had two conflicting real numbers and the client confirmed neither is currently correct (2026-07-20). Replace every occurrence with the real number once confirmed — grep for `689-123-4567` in `src/app/page.tsx` and `src/app/layout.tsx`.
- **No payment processing yet.** "Become a Knight" and "Legacy Donations" buttons currently link to `mailto:` (not a real Stripe checkout). Donations are not actually collectible through the site yet — don't describe this as a working donation flow until Stripe (or similar) is wired up.

## Deployment

Live at https://kothom.vercel.app, auto-deploying from `main` via Vercel's GitHub App integration (confirmed working 2026-07-20). The Vercel project lives under the **`kothom`** team.
