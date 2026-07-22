# Design Context

This project has `PRODUCT.md` (strategy: audiences, mission, giving paths, brand personality) and `DESIGN.md` (visual system: colors, typography, components) at the project root, generated and maintained by the `impeccable` skill. Read both before making UI/design decisions — `DESIGN.md` wins on visual choices, `PRODUCT.md` wins on strategic/voice choices. The visual identity (black-and-cream duotone, terracotta accent, Cinzel + PT Serif typography, the radiant cross mark) is sourced from the ministry's existing Canva materials (`.impeccable/assets/`) — preserve it rather than redesigning from scratch.

**The radiant cross mark is a generated static asset**, not hand-edited or computed at runtime: `public/kothom-mark.svg` has every letter baked in as a real glyph outline path, rendered via `next/image` in `CrossMark` (`src/components/cross-mark.tsx`, used from `src/app/page.tsx`). See `CROSS-MARK.md` at the project root for setup, regeneration, and how its geometry was derived — read it before touching the mark, and don't hand-edit the SVG or reintroduce runtime arc-layout JS for it.

**Font split is deliberate, not an inconsistency:** the mark's wordmark uses Marcellus (Cinzel Decorative was tried and rejected there — too ornate/"swoopy" once tightly arced), while the sitewide `font-display` CSS variable (used only for the hero tagline, nowhere else) is still Cinzel Decorative. Don't "fix" these to match each other.

## Working style on this project

- **Minimize screenshot-taking.** Don't reach for a browser screenshot to check a visual result when avoidable — the user can pull up the running dev server and look themselves. Only take one when it's actually necessary to verify something before finishing a change (e.g. confirming no regression right before a commit), not after every minor tweak in an iterative round.
