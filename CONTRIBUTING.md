# Contributing to KOTHOM

This is the site for Knights of the Higher Order Ministries, a small non-profit. It's a solo-maintained project, but the repo is public and PRs are welcome — this doc explains how changes get from a PR to production.

## Local setup

This project uses [Bun](https://bun.sh).

```bash
bun install
bun dev        # start the dev server at localhost:3000
bun run lint       # Biome
bun run typecheck  # tsc --noEmit
bun run build      # next build
```

Read `AGENTS.md` before touching framework-level code — this repo pins a Next.js version with breaking changes from what's in most models' training data, and `node_modules/next/dist/docs/` is the source of truth over prior knowledge.

For anything touching layout, color, type, or the cross mark, read `PRODUCT.md` (strategy/voice) and `DESIGN.md` (visual system) first — `DESIGN.md` wins on visual choices. See `CROSS-MARK.md` before touching `public/kothom-mark.svg`; it's a generated static asset, not something to hand-edit.

## How a change reaches production

1. Open a PR against `main`.
2. Two required status checks run automatically and **must both pass** — this applies to everyone, including repo admins; there is no bypass:
   - **`quality-gate`** (`.github/workflows/ci.yml`) — lint, typecheck, and `next build` on a plain Ubuntu runner via GitHub Actions.
   - **`Vercel`** — a separate build Vercel's own GitHub App runs in its own environment (different Node/container/env vars than `quality-gate`), which also produces the PR's preview deployment. This is the real signal that what merges will actually deploy.
3. Once both checks are green and the PR is merged to `main`, Vercel auto-deploys to production at [kothoministries.org](https://kothoministries.org).

Force-pushes and branch deletion on `main` are blocked at the GitHub level.

## If you're an external contributor (not a maintainer)

Since this repo is public, opening a PR from a fork triggers two separate approval gates before anything runs on maintainer-controlled infrastructure:

- **GitHub Actions**: workflow runs on a first-time contributor's fork PR require a maintainer to manually approve them before `quality-gate` executes.
- **Vercel preview deployments**: Vercel's "Git Fork Protection" is enabled on this project, so a preview build from a fork PR sits pending until a maintainer approves it in the Vercel dashboard — it won't build (and can't leak build-time env vars) until then.

Practically: push your PR, then wait for a maintainer to approve the pending checks. This isn't a judgment on your PR — it's just how any external PR against this repo works.

## What not to "fix"

A few things look like bugs but are intentional and tracked — check `CLAUDE.md` under "Known placeholders" and "Tooling deliberately not adopted" before opening a PR about them:

- The phone number (`689-123-4567`) is a known placeholder, not a typo.
- "Become a Knight" / "Legacy Donations" intentionally link to `mailto:` — there's no live Stripe checkout yet.
- No test framework, no Dependabot, no pre-commit hooks — each was a deliberate call for a single static marketing page maintained by one person; see `CLAUDE.md` for the reasoning and what would change that calculus.

## Reliability principle

This site is meant to run untouched for years with no maintenance. Don't add a runtime dependency on a third-party service (CDNs, hotlinked images, etc.) for core functionality — self-host assets in `public/` instead. See `CLAUDE.md` for the full rationale.

## License

Contributions are made under this repo's license — see `LICENSE.md`. In short: the code (Apache License 2.0) is free to reuse and modify for any purpose, including running your own ministry's site on it. The KOTHOM name and logo are separately reserved under the Trademark & Brand Notice at the top of `LICENSE.md` — don't reuse those in a way that could be mistaken for the real KOTHOM.
