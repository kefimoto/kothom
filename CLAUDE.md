@AGENTS.md

## Naming

Never call this organization "Kothom Ministries." The correct names are **KOTHOM** or **Knights of the Higher Order Ministries** — use one of those, not an invented hybrid.

# AI docs index

Project-specific context is split into topic files under `docs/ai/`. Read the relevant one(s) before working in that area — don't load them all up front.

- `docs/ai/design.md` — design context (PRODUCT.md/DESIGN.md, the cross mark, font split), working style (screenshots)
- `docs/ai/reliability.md` — no runtime dependency on external services for core functionality
- `docs/ai/tooling.md` — test/lint/pre-commit tooling adopted 2026-07-21, and what was deliberately skipped
- `docs/ai/ci-cd.md` — Dependabot, CodeQL, secret scanning, shellcheck, Lighthouse, branch protection, CI performance, and the two CI footguns
- `docs/ai/security.md` — CSP/security headers in `next.config.ts`, HSTS preload, DNSSEC status
- `docs/ai/content-pipeline.md` — Velite markdown→JSON pipeline, the `--strict` footgun, content authoring rules
- `docs/ai/legal-compliance.md` — `LEGAL_STATUS` switchboard, known placeholders (phone number, no payments, no auth)
- `docs/ai/deployment.md` — production domain, Vercel project, URL rules

**These docs describe behavior tied to real files (`next.config.ts`, `.github/workflows/ci.yml`, `vercel.json`, `package.json`, etc.).** Before relying on a specific claim for a CI/build/config decision, check `git log` on the file(s) it describes — a doc can go stale the moment the underlying config changes without anyone thinking to update it (this happened once already: `ci-cd.md` didn't mention `vercel.json`'s `ignoreCommand` until it was added after the doc was written).

# pr-flow Workflow Best Practices

## Worktree-First: Always Invoke pr-flow Before Any Changes

**Critical pattern:** Invoke pr-flow skill *at the start of work*, before making any changes. Never edit files directly on main, then try to use pr-flow afterwards.

**Wrong way:**
```bash
# ❌ Make changes directly to main
vim CLAUDE.md
git add .
# ... oops, now try to use pr-flow ...
/pr-flow fix/something  # Too late!
```

**Right way:**
```bash
# ✅ Invoke pr-flow FIRST
/pr-flow docs/feature-name - Brief description
# pr-flow creates worktree → then make changes inside worktree
```

**Why:** pr-flow creates isolated worktrees. If changes are already on main when you invoke it, you've defeated the isolation. For subagents especially (audit, critique, polish), worktrees prevent conflicts between parallel agents.

## Check-Watching: Background Pattern for Context Efficiency

When pr-flow waits for checks, run the check loop in **background** to free context:

```bash
# ❌ Blocking (holds context hostage during wait)
gh pr checks 37 --watch
# ... waiting ...
# ... waiting ...

# ✅ Background (context freed for parallel work)
gh pr checks 37 --watch &
# Context returned immediately; can run other agents/work
# [Notification arrives: checks passed, PR merged, clean up]
```

**Applied in pr-flow scripts**:
```bash
# Use run_in_background: true to free context
until rtk gh pr checks 37 2>&1 | grep -q "0 pending" && ! rtk gh pr checks 37 2>&1 | grep -q "FAIL"; do sleep 10; done && rtk gh pr merge 37 --squash --delete-branch
# ↓ Run in background
```

**Token efficiency**: Same time spent waiting, but context available for other work. Enables true parallelization (multiple design audits, multiple fixes running simultaneously).

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
