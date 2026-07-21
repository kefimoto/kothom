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

## Tooling adopted 2026-07-21 (revised)

The 2026-07-21 audit originally skipped a test framework, pre-commit hooks, CODEOWNERS, and `.editorconfig` on "one static page, solo maintainer" grounds. That condition changed the same day: the site is about to grow blog/news content (markdown transformed into static pages), a login flow, and subscription-cancellation (real billing), and a non-technical contributor is joining to edit content directly. So these are now in place:

- **Vitest** (`vitest.config.mts`, `__tests__/`) for unit tests — `bun run test` / `bun run test:watch`.
- **Playwright** (`playwright.config.ts`, `e2e/`) for e2e smoke tests — `bun run test:e2e`. Both run in CI as part of the required `quality-gate` check.
- **husky + lint-staged** — a pre-commit hook (`.husky/pre-commit`) runs `biome check --write` on staged files.
- **`.github/CODEOWNERS`** — `* @kefimoto`. Lets "Require review from Code Owners" be turned on later in GitHub's branch protection UI without another repo change.
- **`.editorconfig`** — consistent whitespace/line-endings regardless of what editor a contributor uses, which matters once someone other than the primary maintainer is editing files.

Current test coverage is intentionally thin (robots/sitemap logic + one page smoke test) — the point was having the harness and CI wiring ready *before* the login/subscription forms land, not retrofitting it after.

## Tooling still deliberately not adopted

- **Dependabot/Renovate.** Skipped deliberately, not just unnoticed: automated dependency-bump PRs create *recurring maintenance work* (reviewing, merging, re-testing) on a site whose whole design goal is running untouched for years. Reconsider only if a dependency has an active security-advisory track record, or once someone is checking in on this repo regularly anyway.
- **Commitlint.** Skipped even though husky/lint-staged were adopted: a non-technical contributor is joining to edit markdown content, and enforcing conventional-commit message format on them is friction with no real payoff yet. Reconsider if the contributor base grows technical enough for commit-message conventions to pay for themselves (e.g. automated changelogs).
- **Security headers/CSP.** Skipped for now: no user input or payment processing is actually wired up yet (see placeholders below). Revisit once Stripe (or similar) goes live for real donations, or once the login flow lands — don't let this slip once auth is real.

## Known placeholders / not-yet-implemented

- **Phone number is a placeholder**: `689-123-4567` appears throughout the site (hero, footer, Pastoral Services). The source Canva deck had two conflicting real numbers and the client confirmed neither is currently correct (2026-07-20). Replace every occurrence with the real number once confirmed — grep for `689-123-4567` in `src/app/page.tsx` and `src/app/layout.tsx`.
- **No payment processing yet.** "Become a Knight" and "Legacy Donations" buttons currently link to `mailto:` (not a real Stripe checkout). Donations are not actually collectible through the site yet — don't describe this as a working donation flow until Stripe (or similar) is wired up.

## Repository & CI

The GitHub repo (`kefimoto/kothom`) is **public**, made so on 2026-07-21 specifically to unlock GitHub branch protection on `main` (a free-tier limitation — private repos require GitHub Pro for protection rules). Checked git history for secrets before flipping visibility; found none.

`main` requires **two** status checks to pass before any push lands, **including from admins** (`enforce_admins` is on) — there is no bypass:
- **`quality-gate`** — the GitHub Actions workflow at `.github/workflows/ci.yml` (lint, typecheck, `next build` in a plain Ubuntu runner).
- **`Vercel`** — the commit status Vercel's own GitHub App integration posts once *its* build (and, for PRs, the resulting preview deployment) actually succeeds. This is a separate build environment from `quality-gate` (Vercel's own container/Node version/env vars), so it's the real guarantee that what will actually deploy does deploy successfully — a PR can't merge on a broken preview.

Force-pushes and branch deletion are blocked as part of the same protection rule.

### CI performance

`quality-gate` runs in ~40s (down from ~58s) after caching Playwright's Chromium binary (`~/.cache/ms-playwright`, keyed on `bun.lock`) and dropping `--with-deps` — `ubuntu-latest` already ships every OS lib Chromium needs, so `--with-deps`'s `apt-get update` was ~35s of pure no-op overhead. The workflow also cancels a still-running CI job when a newer commit lands on the same ref (`concurrency` block) and does a shallow checkout (`fetch-depth: 1`).

Further optimizations considered and deliberately deferred — revisit when their trigger condition below is actually true, not preemptively:
- **`.next/cache` build caching.** `next build` is ~9s today; only worth caching once route/page count grows enough (blog content landing) that build time becomes a meaningful share of the job.
- **Skip CI on content-only changes.** Once the non-technical contributor is regularly pushing markdown edits, running full lint/typecheck/e2e for a copy fix is wasteful — but this needs the actual blog content pipeline built first, so the path filter can target the right directories without accidentally skipping validation for content that affects the build.
- **Splitting `quality-gate` into parallel jobs.** Only pays off once the job is meaningfully longer than ~40s — each additional job pays ~5-10s of runner setup overhead, which would currently erase the gain. Also requires updating branch protection to require multiple check names instead of the current single `quality-gate` name.

Since the repo is public, anyone can open a PR from a fork. Two independent approval gates stop that from reaching maintainer-controlled infrastructure unauthorized: GitHub Actions requires manual approval to run `quality-gate` on a first-time fork contributor's PR, and Vercel's project-level **Git Fork Protection** is enabled (confirmed 2026-07-21 via `vercel project protection kothom`), which holds fork-originated preview builds pending until a maintainer approves them in the Vercel dashboard — this prevents both unauthorized deploys and build-time env var exfiltration via a malicious build script. See `CONTRIBUTING.md` for the contributor-facing explanation.

## Deployment

Live at **https://kothoministries.org** (the real customer-facing domain — already wired up as a custom domain on the Vercel project, confirmed 2026-07-21). `https://kothom.vercel.app` is the underlying Vercel deployment URL/infra alias; customers never see or use it. Auto-deploys from `main` via Vercel's GitHub App integration (confirmed working 2026-07-20). The Vercel project lives under the **`kothom`** team.

**Any customer-facing URL in code (metadata, canonical links, sitemap, robots.txt, OG images, JSON-LD, etc.) must use `kothoministries.org`, never `kothom.vercel.app`.**

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
