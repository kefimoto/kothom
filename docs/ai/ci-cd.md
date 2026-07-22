# CI/CD hardening (added 2026-07-21)

- **Dependabot** (`.github/dependabot.yml`) — grouped, weekly, not the default one-PR-per-dependency-per-bump: minor/patch bumps land as one batched PR per ecosystem (`bun`, `github-actions`); major bumps land individually since those are the ones most likely to need an actual human look rather than a rubber-stamp merge. Chose Dependabot over Renovate specifically to avoid installing a third-party GitHub App with repo write access — Dependabot's grouping feature closes most of the gap that used to be Renovate's main edge. Also enabled **Dependabot security updates** (a separate, narrower toggle from version-bump automation — only fires on an actual CVE in a dependency, effectively zero routine noise) and GitHub's **vulnerability alerts**.
  - **TypeScript major-version bumps are ignored** (2026-07-21) — TS 7.0 is the native Go compiler and doesn't expose the classic API `next build` needs, so the bump can't be taken until Next.js supports it. The ignore rule has a `REMOVE THIS` comment in the YAML itself; don't let it become permanent by habit — check back periodically whether Next.js has caught up.
- **GitHub default CodeQL setup** and **secret scanning + push protection** — both repo *settings* (Settings → Code security), not workflow files; both free for public repos. Enabled via the GitHub API rather than a committed file.
- **shellcheck** — a required, unconditional step in `quality-gate` (`.github/workflows/ci.yml`). Runs on every PR regardless of the content/code fast-path filter, since it needs no bun/node setup and takes a fraction of a second; `ubuntu-latest` ships it preinstalled.
- **Lighthouse CI** — runs in `quality-gate` for code-changed PRs, but is **informational only, not blocking** (`continue-on-error: true`, no `lighthouserc`/budget file, so nothing is actually asserted). Checked the real production baseline on 2026-07-21 against `kothoministries.org`: Accessibility/Best Practices/SEO are all 100, but **Performance is 69** — driven almost entirely by Total Blocking Time (1,010ms) and Time to Interactive (6.1s), not LCP or CLS (both solid). A standard 90-threshold budget would fail every PR starting today, which is exactly why this isn't blocking yet. **Revisit turning this into a real gate once (a) the TBT/TTI regression above is actually investigated and fixed, and (b) a deliberate budget number is chosen** — not a default like "90" copy-pasted without evidence it's achievable here.

## Repository & CI

The GitHub repo (`kefimoto/kothom`) is **public**, made so on 2026-07-21 specifically to unlock GitHub branch protection on `main` (a free-tier limitation — private repos require GitHub Pro for protection rules). Checked git history for secrets before flipping visibility; found none.

`main` requires **two** status checks to pass before any push lands, **including from admins** (`enforce_admins` is on) — there is no bypass:
- **`quality-gate`** — the GitHub Actions workflow at `.github/workflows/ci.yml` (content validation, lint, typecheck, unit tests, `next build`, and Playwright e2e in a plain Ubuntu runner). Content-only PRs run just the content validation step — see "CI performance" below.
- **`Vercel`** — the commit status Vercel's own GitHub App integration posts once *its* build (and, for PRs, the resulting preview deployment) actually succeeds. This is a separate build environment from `quality-gate` (Vercel's own container/Node version/env vars), so it's the real guarantee that what will actually deploy does deploy successfully — a PR can't merge on a broken preview.

Force-pushes and branch deletion are blocked as part of the same protection rule.

### CI performance

`quality-gate` runs in ~40s (down from ~58s) after caching Playwright's Chromium binary (`~/.cache/ms-playwright`, keyed on `bun.lock`) and dropping `--with-deps` — `ubuntu-latest` already ships every OS lib Chromium needs, so `--with-deps`'s `apt-get update` was ~35s of pure no-op overhead. The workflow also cancels a still-running CI job when a newer commit lands on the same ref (`concurrency` block) and does a shallow checkout (`fetch-depth: 1`).

Two of the three deferred optimizations were taken on 2026-07-21, once the content pipeline landed and made their trigger conditions true:

- **`.next/cache` build caching** — now enabled, keyed on `bun.lock` + `src/**` + `content/**`, with looser `restore-keys` so an unrelated edit still gets a warm partial cache.
- **Content-only fast path** — a `dorny/paths-filter` step sets a `code` output; lint/typecheck/unit/build/e2e are skipped when a pull request touches only `content/**` and `**/*.md`. Such a PR is still fully validated: `bunx velite --clean --strict` always runs (schema-checking every content file, ~2s), and Vercel's own build is a separately required status check that runs regardless.
- **Vercel's `ignoreCommand` (`vercel.json`, added after a later PR)** skips Vercel's own build for commits touching only `*.md`, `docs/`, `.github/`, or `scripts/` — a broader match than `quality-gate`'s content-only fast path above (this one also covers docs and CI/script changes, not just `content/**`). Vercel still posts a (skipped/no-op) status so branch protection isn't blocked, but the "runs regardless" claim above is only accurate for the `content/**` case, not for pure docs/CI PRs like this one.
- **Also fixed:** `playwright.config.ts` was running `bun run build && bun run start` in its `webServer`, compiling the whole app a *second* time in a job that had already built it. Under CI it now runs `bun run start` only.

Still deliberately deferred:
- **Splitting `quality-gate` into parallel jobs.** Each additional job pays ~5-10s of runner setup overhead, which would currently erase the gain. Also requires updating branch protection to require multiple check names instead of the current single `quality-gate` name.

### Two CI footguns, both load-bearing

1. **Never add top-level `paths-ignore` to `.github/workflows/ci.yml`.** Branch protection requires a check named exactly `quality-gate` with `enforce_admins` on. A workflow filtered out by `paths-ignore` never runs, so it never posts that status, and the PR sits on "Expected — Waiting for status" forever with no way to merge. The job must always run; only its *steps* are conditional.
2. **`dorny/paths-filter` ORs a filter's patterns by default, so `predicate-quantifier: "every"` is load-bearing.** The filter first shipped as `['**', '!content/**', '!**/*.md']`, which reads like "everything except content and markdown" but isn't: under the default `some` quantifier, `'**'` alone matches every file and the negations act as alternatives rather than exclusions. `code` was therefore *always* true and the fast path never engaged — verified against run `29841139707`, where every step ran on a four-file markdown-only PR, behind a green check.

   With `every`, a file must satisfy all patterns, so a list of pure negations means "changed files that are neither content nor markdown" — the actual question. **Keep the pattern list minimal:** under `every`, each added pattern makes `code` *harder* to satisfy, which biases toward skipping checks, the dangerous direction. `__tests__/ci-path-filter.test.ts` parses the real workflow and reproduces the action's matching against both directions; it exists because this bug's signature is CI staying green while doing nothing.

   The fast path also only applies to `pull_request` events — a push to `main` always runs the full gate.

Since the repo is public, anyone can open a PR from a fork. Two independent approval gates stop that from reaching maintainer-controlled infrastructure unauthorized: GitHub Actions requires manual approval to run `quality-gate` on a first-time fork contributor's PR, and Vercel's project-level **Git Fork Protection** is enabled (confirmed 2026-07-21 via `vercel project protection kothom`), which holds fork-originated preview builds pending until a maintainer approves them in the Vercel dashboard — this prevents both unauthorized deploys and build-time env var exfiltration via a malicious build script. See `CONTRIBUTING.md` for the contributor-facing explanation.
