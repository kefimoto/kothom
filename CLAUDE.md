@AGENTS.md

## Design Context

This project has `PRODUCT.md` (strategy: audiences, mission, giving paths, brand personality) and `DESIGN.md` (visual system: colors, typography, components) at the project root, generated and maintained by the `impeccable` skill. Read both before making UI/design decisions — `DESIGN.md` wins on visual choices, `PRODUCT.md` wins on strategic/voice choices. The visual identity (black-and-cream duotone, terracotta accent, Cinzel + PT Serif typography, the radiant cross mark) is sourced from the ministry's existing Canva materials (`.impeccable/assets/`) — preserve it rather than redesigning from scratch.

**The radiant cross mark is a generated static asset**, not hand-edited or computed at runtime: `public/kothom-mark.svg` has every letter baked in as a real glyph outline path, rendered via `next/image` in `CrossMark` (`src/app/page.tsx`). See `CROSS-MARK.md` at the project root for setup, regeneration, and how its geometry was derived — read it before touching the mark, and don't hand-edit the SVG or reintroduce runtime arc-layout JS for it.

**Font split is deliberate, not an inconsistency:** the mark's wordmark uses Marcellus (Cinzel Decorative was tried and rejected there — too ornate/"swoopy" once tightly arced), while the sitewide `font-display` CSS variable (used only for the hero tagline, nowhere else) is still Cinzel Decorative. Don't "fix" these to match each other.

## Working style on this project

- **Minimize screenshot-taking.** Don't reach for a browser screenshot to check a visual result when avoidable — the user can pull up the running dev server and look themselves. Only take one when it's actually necessary to verify something before finishing a change (e.g. confirming no regression right before a commit), not after every minor tweak in an iterative round.

## Reliability principles

This site should keep working untouched for years with no maintenance. Concretely:

- **No runtime dependency on external services for core functionality.** Don't hotlink images or other assets from third-party CDNs (e.g. `images.unsplash.com`) — download and self-host them in `public/` instead (see `.impeccable/assets/image-credits.md` for sourcing/licensing records). If a third-party service goes down or changes its API, the site should be unaffected.
- Apply this same standard to future dependencies: prefer self-contained, self-hosted solutions over ones that assume an always-available external service, unless the feature genuinely requires live external data (e.g. Stripe for payments).

## Known placeholders / not-yet-implemented

- **Phone number is a placeholder**: `689-123-4567` appears throughout the site (hero, footer, Pastoral Services). The source Canva deck had two conflicting real numbers and the client confirmed neither is currently correct (2026-07-20). Replace every occurrence with the real number once confirmed — grep for `689-123-4567` in `src/app/page.tsx` and `src/app/layout.tsx`.
- **No payment processing yet.** "Become a Knight" and "Legacy Donations" buttons currently link to `mailto:` (not a real Stripe checkout). Donations are not actually collectible through the site yet — don't describe this as a working donation flow until Stripe (or similar) is wired up.

## Deployment

Live at https://kothom.vercel.app, auto-deploying from `main` via Vercel's GitHub App integration (confirmed working 2026-07-20). The Vercel project lives under the **`kothom`** team.

<!-- rtk-instructions v2 -->
# RTK (Rust Token Killer) - Token-Optimized Commands

## Golden Rule

**Always prefix commands with `rtk`**. If RTK has a dedicated filter, it uses it. If not, it passes through unchanged. This means RTK is always safe to use.

**Important**: Even in command chains with `&&`, use `rtk`:
```bash
# ❌ Wrong
git add . && git commit -m "msg" && git push

# ✅ Correct
rtk git add . && rtk git commit -m "msg" && rtk git push
```

## RTK Commands by Workflow

### Build & Compile (80-90% savings)
```bash
rtk cargo build         # Cargo build output
rtk cargo check         # Cargo check output
rtk cargo clippy        # Clippy warnings grouped by file (80%)
rtk tsc                 # TypeScript errors grouped by file/code (83%)
rtk lint                # ESLint/Biome violations grouped (84%)
rtk prettier --check    # Files needing format only (70%)
rtk next build          # Next.js build with route metrics (87%)
```

### Test (60-99% savings)
```bash
rtk cargo test          # Cargo test failures only (90%)
rtk go test             # Go test failures only (90%)
rtk jest                # Jest failures only (99.5%)
rtk vitest              # Vitest failures only (99.5%)
rtk playwright test     # Playwright failures only (94%)
rtk pytest              # Python test failures only (90%)
rtk rake test           # Ruby test failures only (90%)
rtk rspec               # RSpec test failures only (60%)
rtk test <cmd>          # Generic test wrapper - failures only
```

### Git (59-80% savings)
```bash
rtk git status          # Compact status
rtk git log             # Compact log (works with all git flags)
rtk git diff            # Compact diff (80%)
rtk git show            # Compact show (80%)
rtk git add             # Ultra-compact confirmations (59%)
rtk git commit          # Ultra-compact confirmations (59%)
rtk git push            # Ultra-compact confirmations
rtk git pull            # Ultra-compact confirmations
rtk git branch          # Compact branch list
rtk git fetch           # Compact fetch
rtk git stash           # Compact stash
rtk git worktree        # Compact worktree
```

Note: Git passthrough works for ALL subcommands, even those not explicitly listed.

### GitHub (26-87% savings)
```bash
rtk gh pr view <num>    # Compact PR view (87%)
rtk gh pr checks        # Compact PR checks (79%)
rtk gh run list         # Compact workflow runs (82%)
rtk gh issue list       # Compact issue list (80%)
rtk gh api              # Compact API responses (26%)
```

### JavaScript/TypeScript Tooling (70-90% savings)
```bash
rtk pnpm list           # Compact dependency tree (70%)
rtk pnpm outdated       # Compact outdated packages (80%)
rtk pnpm install        # Compact install output (90%)
rtk npm run <script>    # Compact npm script output
rtk npx <cmd>           # Compact npx command output
rtk prisma              # Prisma without ASCII art (88%)
```

### Files & Search (60-75% savings)
```bash
rtk ls <path>           # Tree format, compact (65%)
rtk read <file>         # Code reading with filtering (60%)
rtk grep <pattern>      # Search grouped by file (75%). Format flags (-c, -l, -L, -o, -Z) run raw.
rtk find <pattern>      # Find grouped by directory (70%)
```

### Analysis & Debug (70-90% savings)
```bash
rtk err <cmd>           # Filter errors only from any command
rtk log <file>          # Deduplicated logs with counts
rtk json <file>         # JSON structure without values
rtk deps                # Dependency overview
rtk env                 # Environment variables compact
rtk summary <cmd>       # Smart summary of command output
rtk diff                # Ultra-compact diffs
```

### Infrastructure (85% savings)
```bash
rtk docker ps           # Compact container list
rtk docker images       # Compact image list
rtk docker logs <c>     # Deduplicated logs
rtk kubectl get         # Compact resource list
rtk kubectl logs        # Deduplicated pod logs
```

### Network (65-70% savings)
```bash
rtk curl <url>          # Compact HTTP responses (70%)
rtk wget <url>          # Compact download output (65%)
```

### Meta Commands
```bash
rtk gain                # View token savings statistics
rtk gain --history      # View command history with savings
rtk discover            # Analyze Claude Code sessions for missed RTK usage
rtk proxy <cmd>         # Run command without filtering (for debugging)
rtk init                # Add RTK instructions to CLAUDE.md
rtk init --global       # Add RTK to ~/.claude/CLAUDE.md
```

## Token Savings Overview

| Category | Commands | Typical Savings |
|----------|----------|-----------------|
| Tests | vitest, playwright, cargo test | 90-99% |
| Build | next, tsc, lint, prettier | 70-87% |
| Git | status, log, diff, add, commit | 59-80% |
| GitHub | gh pr, gh run, gh issue | 26-87% |
| Package Managers | pnpm, npm, npx | 70-90% |
| Files | ls, read, grep, find | 60-75% |
| Infrastructure | docker, kubectl | 85% |
| Network | curl, wget | 65-70% |

Overall average: **60-90% token reduction** on common development operations.
<!-- /rtk-instructions -->