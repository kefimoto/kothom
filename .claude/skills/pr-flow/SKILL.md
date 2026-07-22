---
name: pr-flow
description: Use when the user wants an isolated set of changes taken from working branch to merged PR without touching their main checkout or disturbing other agents/sessions that may be running there — e.g. "do the whole nine", "worktree this and PR it", "ship this as a PR", "branch, commit, push, merge", "put this up and merge it". Runs the full worktree → commit → push → PR → checks → squash-merge → cleanup cycle end to end.
version: 1.0.0
user-invocable: true
argument-hint: "[branch-name or short description of the change]"
license: Apache 2.0
---

Takes a set of changes from an isolated worktree to a merged, cleaned-up PR — the full cycle, run the same way every time instead of re-derived per session.

## Why a worktree, always

Never make these changes directly in the user's primary checkout. A worktree gives an isolated working directory on its own branch while sharing the same `.git` object database — so another agent or session working in the primary checkout is never disturbed, and there's no risk of clobbering uncommitted work there. This applies even for tiny changes (e.g. a one-line doc fix); the cost of a worktree is low and the cost of a collision is not.

## Steps

1. **Create the worktree from `main`** before touching any files:
   ```
   git worktree add <scratchpad>/<branch-name> -b <branch-name>
   ```
   Use the session's scratchpad directory as the parent path. Pick `<branch-name>` to describe the change (e.g. `fix-donate-button-typo`, not `wip` or `patch-1`).

2. **Make the requested changes inside the worktree only.**

3. **If the repo has pre-commit hooks (husky/lint-staged) and this is a fresh worktree, run the package install first.** A brand-new worktree has no `node_modules` — the pre-commit hook will fail with something like `Task failed to spawn: biome ... ENOENT` if you skip this. Run `bun install` (or the repo's equivalent) before committing.

4. **Stage, commit, push:**
   - `git add <specific files>` — never a blanket `-A` or `.`.
   - `git commit` with a message ending in the standard Claude Code co-author trailer.
   - `git push -u origin <branch-name>`.

5. **Open the PR:** `gh pr create` with a `## Summary` and `## Test plan` body (see the repo's PR template / CLAUDE.md conventions if present).

6. **Wait for checks:** `gh pr checks <n> --watch` until nothing is pending or failing.

7. **Handle "not up to date with base" on merge.** If checks were green but `gh pr merge` reports the head branch isn't up to date with base, `main` moved after checks ran (a real risk on active repos — don't assume it's a stale cache without checking):
   - `git fetch origin main`
   - `git merge-base --is-ancestor origin/main HEAD` to confirm
   - if it's genuinely behind: `git rebase origin/main` then `git push --force-with-lease`
   - re-run step 6 before retrying the merge.

8. **Merge:** make sure the branch isn't checked out anywhere convenient to conflict with cleanup (`git checkout main` in the worktree, or just proceed — the primary checkout is untouched either way), then `gh pr merge <n> --squash --delete-branch`.

9. **Clean up thoroughly, and verify it actually happened:**
   - `git worktree remove <path>`
   - `git branch -d <branch-name>` locally
   - `--delete-branch` on the merge can silently no-op (observed in practice). Confirm the remote branch is actually gone — `gh api repos/<owner>/<repo>/branches/<branch-name>` returning 404 is the real signal, not just the merge command's exit code. If it's still there, `git push origin --delete <branch-name>`.

10. **Sync the primary checkout:** `git pull` there so the user's working directory reflects the merge. This is the only step that touches the primary checkout, and it's non-destructive (a fast-forward pull) even if another agent has uncommitted changes there.

## What this skill does not change

Push, merge, and branch-deletion are still real actions with real consequences — this skill automates the mechanical sequence, it does not grant standing authorization to skip confirming with the user. If the user hasn't already told you to ship/merge this specific change, ask before step 4 (push) and before step 8 (merge), per the project's Git Safety Protocol.
