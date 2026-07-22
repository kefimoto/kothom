# design-sync Skill

Comprehensive design system audit, critique, and polish workflow for KOTHOM. Runs audit, design review, and quality verification across all pages, applies fixes, and manages PR workflow via pr-flow.

## When to Use

- After significant UI changes to verify design system compliance
- Before production deployment to catch accessibility/quality issues
- To refactor multi-page designs (layout, spacing, typography, color)
- To verify DESIGN.md adherence across the site

## Workflow

### Phase 1: Audit (Technical Quality)

Spawns agent to run `/impeccable audit` on all pages (homepage + /about, /contact, /get-help, /give):
- Accessibility (WCAG AAA target)
- Performance (image optimization, animations, bundle)
- Theming (100% token usage, no hard-codes)
- Responsive Design (mobile-first, touch targets, overflow)
- Anti-Patterns (AI slop tells, DESIGN.md violations)

**Output:** Score 0-4 per dimension, /20 total per page. Identifies P0-P3 issues.

### Phase 2: Critique (Design Quality)

Spawns dual-agent system:
- **Assessment A (Design Review):** Visual inspection, Nielsen heuristics (0-4 per heuristic), AI slop detection, emotional journey, personas
- **Assessment B (Detector):** Automated pattern scan + browser overlay (if available)

**Output:** Heuristics scores per page, systemic issues, priority problems ranked P0-P3, persona red flags.

### Phase 3: Polish (Production Readiness)

Spawns agent to run `/impeccable polish` on all pages:
- Heading hierarchy, alt text, semantic markup
- Focus indicators, touch targets, color contrast
- Motion/reduced-motion compliance
- Copy quality (brand voice, typos, placeholders)
- DESIGN.md compliance (corners, duotone, accents, flat, 18px floor)

**Output:** Page-by-page checklist, fixes applied, zero P0/P1 verification.

### Phase 4: Apply Fixes (If Issues Found)

Spawns agents to run recommended Impeccable commands via pr-flow:
- `/impeccable clarify` — Copy refinement, alt text voice, messaging clarity
- `/impeccable adapt` — Responsive fixes, mobile spacing, touch targets
- `/impeccable layout` — Reorganize sections, reduce cognitive load
- `/impeccable polish` — Final quality pass

**Critical:** Each agent uses **pr-flow skill** (not direct commits) to:
1. Create isolated worktree from main
2. Make changes in worktree only
3. Commit with descriptive message
4. Push and create PR
5. Wait for checks
6. Merge and cleanup

### Phase 5: Verify & Report

Final verification:
- All pages pass audit (≥18/20 recommended, no P0/P1 issues)
- Heuristics average ≥35/40 per page
- Zero DESIGN.md violations
- WCAG AA+ on all pages
- All PRs merged and main branch synced

## Usage

```bash
# Full sync (all phases)
/design-sync

# Specific phase only (optional)
/design-sync audit
/design-sync critique
/design-sync polish
/design-sync fix
/design-sync verify
```

## Key Workflow Rules

### pr-flow Is Non-Negotiable
- **Never commit directly to main.** Branch protection will block and/or delete uncommitted work.
- **Always use pr-flow skill.** Creates isolated worktree before any file changes.
- **One worktree per fix.** Multiple agents can run in parallel; each gets its own worktree via pr-flow.

### Subagent Parallelization
Phases 1-3 run in parallel (3 agents):
- Audit agent: Technical quality checks
- Critique agent (Assessment A + B): Design review + detector
- Polish agent: Production readiness

Fixes (Phase 4) run via pr-flow (isolated worktrees, no conflicts).

## Expected Outcomes

**Excellent state** (target):
- All pages: 18-20/20 audit, 35-40/40 heuristics
- Zero P0/P1 issues
- 100% DESIGN.md compliance
- WCAG AA+ accessibility
- No AI slop tells

**Good state** (acceptable):
- All pages: 15-20/20 audit, 30-40/40 heuristics
- P2-only issues (polish-level refinements)
- 95%+ DESIGN.md compliance
- WCAG AA (AAA preferred)

**Poor state** (needs work):
- Any page <15/20 audit or <30/40 heuristics
- P0/P1 issues present
- <95% DESIGN.md compliance
- WCAG A violations

## Troubleshooting

### Subagent Timeouts
Some agents (especially critique with dual-assessment architecture) may timeout. If so:
- Agent will notify on completion
- You can continue and trigger next phase manually
- Or wait for automatic completion notification

### PR Checks Fail
If CodeQL or other checks block merge:
- Agent's pr-flow will handle rebasing: `git fetch origin main && git rebase origin/main && git push --force-with-lease`
- Merge will retry automatically

### If You Accidentally Commit Directly to Main
This should be blocked by branch protection, but if it happens:
1. Do NOT push. Branch protection will reject.
2. Reset: `git reset --soft HEAD~1` (keeps changes staged)
3. Create feature branch: `git checkout -b feat/name`
4. Commit there: `git commit -m "message"`
5. Use pr-flow to push and create PR

## Success Checklist

After running design-sync, verify:

- [ ] All pages score ≥18/20 on audit (or acknowledge lower scores with P2-only issues)
- [ ] All pages score ≥35/40 on heuristics average
- [ ] Zero P0 issues (blocking production)
- [ ] Zero P1 issues (or documented for next iteration)
- [ ] 100% DESIGN.md compliance verified
- [ ] WCAG AA+ on all pages (AAA on homepage/primary)
- [ ] No AI slop tells detected (detector scan clean)
- [ ] All PRs merged to main
- [ ] Main branch synced locally (`git pull`)
- [ ] Ready to deploy or pass to QA

## Related Skills/Tools

- **Impeccable** — Individual design commands (audit, critique, polish, etc.)
- **pr-flow** — Branch-to-merge workflow (always use this, never commit to main directly)
