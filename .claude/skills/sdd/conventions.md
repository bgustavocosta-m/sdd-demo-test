## The graph

Every issue links back to where it came from, so the path from idea to merged PR can be walked in GitHub's UI.

- **Map** `sdd:map` — one per project. An index: Destination, Notes, Decisions so far (one line + link per closed decision ticket), Out of scope. Detail lives in tickets, the map only points at it.
- **Decision ticket** `sdd:grilling` or `sdd:research` — sub-issue of the map. Its body is a question; its answer is the resolution comment it closes with.
- **Spec** `sdd:spec` — sub-issue of the map, blocked by every decision ticket.
- **Build ticket** `sdd:build` — sub-issue of the spec, blocked by the build tickets it needs. Closed by its PR.

In anything the user reads, name issues by title with the number inside the link: `[How do players find each other? (#4)](url)`.

## GitHub operations

`gh api` fills `{owner}` and `{repo}` from the current clone. Links take the issue's **database id**, not its number: `gh api repos/{owner}/{repo}/issues/<n> --jq .id`.

- Create: `gh issue create --title "…" --label <label> --body-file -` with a heredoc body. It prints the URL; the number is its last segment. Missing label → `gh label create <label>`.
- Sub-issue: `gh api -X POST repos/{owner}/{repo}/issues/<parent>/sub_issues -F sub_issue_id=<child id>`
- Blocked by: `gh api -X POST repos/{owner}/{repo}/issues/<n>/dependencies/blocked_by -F issue_id=<blocker id>`
- Children: `gh api repos/{owner}/{repo}/issues/<parent>/sub_issues --jq '.[] | {number, title, state, labels: [.labels[].name], assignees: [.assignees[].login]}'`
- Open blockers: `gh api repos/{owner}/{repo}/issues/<n> --jq .issue_dependencies_summary.blocked_by` — 0 means unblocked.
- Claim: `gh issue edit <n> --add-assignee @me` — your first write whenever you work a ticket.
- Resolve: `gh issue comment <n> --body-file -`, then `gh issue close <n>`.
- Edit the map: read with `gh issue view <map> --json body --jq .body`, write back with `gh issue edit <map> --body-file -`.

Create all issues first, then wire links in a second pass — links need ids.

## Worktrees

When a phase says **fresh worktree**, cut it from `origin/main` straight after `git fetch origin`, so it starts from what's on GitHub now. From the main checkout:

- Build: `git worktree add --no-track -b ticket-<n>-<slug> .claude/worktrees/ticket-<n>-<slug> origin/main`
- Research: `git worktree add --detach .claude/worktrees/research-<n> origin/main`

Switch the session into it (`EnterWorktree` with its `path`) and do all of the ticket's file work there — edits, installs, tests, commits. One worktree per ticket keeps the main checkout clean on `main`, so sessions can work tickets in parallel. `--no-track` stops the branch tracking `main`, so it pushes under its own name.

A research worktree is scratch: once the findings are posted, switch back (`ExitWorktree`, keep) and `git worktree remove --force` it. A build worktree stays until its PR merges.

## Grilling

When a phase says **grill**: ask in rounds of at most 4 numbered questions, each one whose prerequisites are already settled. One or two lines per question, with your recommendation:

    **Q1 — <title>**: <question; options if any>
    → Recommended: <answer> — <one-line why>

Wait for the answers, then ask the next round. Look facts up yourself; put only decisions to the user. "Take your recommendations" accepts them all. Done when no question is left open and the user confirms your one-paragraph summary.
