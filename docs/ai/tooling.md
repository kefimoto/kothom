# Tooling adopted 2026-07-21 (revised)

The 2026-07-21 audit originally skipped a test framework, pre-commit hooks, CODEOWNERS, and `.editorconfig` on "one static page, solo maintainer" grounds. That condition changed the same day: the site is about to grow blog/news content (markdown transformed into static pages), a login flow, and subscription-cancellation (real billing), and a non-technical contributor is joining to edit content directly. So these are now in place:

- **Vitest** (`vitest.config.mts`, `__tests__/`) for unit tests — `bun run test` / `bun run test:watch`.
- **Playwright** (`playwright.config.ts`, `e2e/`) for e2e smoke tests — `bun run test:e2e`. Both run in CI as part of the required `quality-gate` check.
- **husky + lint-staged** — a pre-commit hook (`.husky/pre-commit`) runs `biome check --write` on staged files.
- **`.github/CODEOWNERS`** — `* @kefimoto`. Lets "Require review from Code Owners" be turned on later in GitHub's branch protection UI without another repo change.
- **`.editorconfig`** — consistent whitespace/line-endings regardless of what editor a contributor uses, which matters once someone other than the primary maintainer is editing files.

Current test coverage (as of 2026-07-22): seven Vitest unit-test files (`robots`, `sitemap`, `page` smoke test, `reveal`, `compliance`, `content-integrity`, `ci-path-filter`) and three Playwright specs (`homepage`, `navigation`, `animations`) under `__tests__/` and `e2e/` respectively — grown well past the original "robots/sitemap + one smoke test" baseline as the CI/compliance/content-pipeline work landed. The point was having the harness and CI wiring ready *before* the login/subscription forms land, not retrofitting it after — coverage has kept pace with each addition since.

## Tooling still deliberately not adopted

- **Commitlint.** Skipped even though husky/lint-staged were adopted: a non-technical contributor is joining to edit markdown content, and enforcing conventional-commit message format on them is friction with no real payoff yet. Reconsider if the contributor base grows technical enough for commit-message conventions to pay for themselves (e.g. automated changelogs).
- ~~Security headers/CSP~~ — enabled 2026-07-21 (see `security.md`), ahead of the original "wait for Stripe/auth" plan. The ministry decided not to wait.
- ~~Dependabot/Renovate~~ — adopted 2026-07-21 (see `ci-cd.md`), reversing the original "recurring maintenance work" objection now that someone (the maintainer, working with Claude Code) is actively in this repo regularly — exactly the condition the original note said would justify revisiting it.
