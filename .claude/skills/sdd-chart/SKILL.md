---
name: sdd-chart
description: SDD phase 1 — grill the idea into a map issue plus the decision tickets (grilling/research) the spec needs, and fire research subagents.
disable-model-invocation: true
---

# Chart

Part of the [sdd](../sdd/SKILL.md) workflow. Read [conventions.md](../sdd/conventions.md) first — the issue graph, GitHub operations, worktrees and grilling format it describes apply here.

Turn the idea into a map and the decision tickets the spec will need. This phase names questions; the tickets answer them.

1. **Grill the destination**: what we're building, for whom, what "done" looks like at the end of the time box, and what's explicitly out. Ask for the time box if it's unstated.
2. **Grill the frontier, breadth-first**: sweep the whole space — stack, architecture, each feature, networking, testing, deploy — naming the open decisions without settling them. The user may answer cheap ones on the spot; those become Notes.
3. **Choose the tickets**: the decisions the spec can't be written without. Fit the count to the time box — a one-hour POC gets 3–5. Type each:
   - `sdd:research` — a fact outside the repo: a library's API, a service's limits. Agent-only.
   - `sdd:grilling` — a choice only the humans can make.

   Show the list and confirm it with the user.
4. **Publish**: the map, then each ticket, then the links — every ticket a sub-issue of the map, plus a blocked-by edge wherever one ticket's answer changes another's question.
5. **Fire research**: for each research ticket, launch a background subagent to read primary sources (official docs, source code), post its findings with citations as a comment, and close the ticket. Subagents leave the map to the main session.
6. Show the map link and the ticket titles. Stop.

Map body:

```markdown
## Destination

<one or two lines: what exists when we're done>

## Notes

<time box · defaults decided on the spot · standing preferences>

## Decisions so far

## Out of scope
```

Ticket body:

```markdown
## Question

<one sentence>

## Why it matters

<what in the spec hangs on the answer>

## Options

<the candidates on the table, if known>
```
