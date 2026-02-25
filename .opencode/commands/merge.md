---
description: Create branch, PR, and merge for current changes
agent: build
model: anthropic/claude-sonnet-4-6
---

You are executing a merge workflow. Follow these steps exactly and stop if any step fails.

Arguments: `$1` is the branch type (e.g. "fix" or "feature"), `$2` is an optional GitHub issue number (e.g. "#123" or "123").

## Step 1: Understand the changes

- Run `git status` and `git diff` (staged + unstaged) to understand all current changes.
- Run `git log --oneline -5` to see recent commits for context.

## Step 2: Create a new branch and commit

- Generate a short kebab-case slug (2-4 words) that describes the changes.
- Create and checkout a new branch named `$1/<slug>` (e.g. `fix/broken-tray-icon` or `feature/add-export`).
- Stage all changes with `git add -A`.
- Commit with a very short, meaningful commit message (imperative mood, max ~50 chars). Do NOT skip git hooks.

## Step 3: Push and create a PR

- Push the branch: `git push -u origin HEAD`
- Create a PR using `gh pr create`:
  - Title: a concise summary of the changes.
  - Body: 1-3 bullet points summarizing what changed.
  - If an issue number was provided in `$2`, append a blank line and then `Closes $2` (include the `#` prefix, add it if the user only passed a number). Use "Fixes" for fix branches, "Closes" for everything else.

## Step 4: Merge the PR

- Merge the PR immediately using: `gh pr merge --admin --merge --delete-branch`
- After merge, switch back to main: `git checkout main && git pull`

## Important

- Do NOT ask for confirmation at any step. Execute the full workflow.
- Do NOT use `--no-verify` on commits.
- If `$1` is missing, stop and ask the user for the branch type.
- The issue number `$2` is optional. If not provided, skip the "Closes/Fixes" line.
