---
name: sdd-tickets
description: SDD phase 4 — slice the spec into tracer-bullet sdd:build tickets wired with blocked-by edges.
disable-model-invocation: true
---

# Tickets

Part of the [sdd](../sdd/SKILL.md) workflow. Read [conventions.md](../sdd/conventions.md) first — the issue graph, GitHub operations, worktrees and grilling format it describes apply here.

Slice the spec into build tickets.

1. Read the spec.
2. Draft **tracer-bullet** slices: each cuts through every layer (UI, game logic, networking, tests) and ends demoable in a browser. The first slice is the thinnest end-to-end path; later slices widen it. Each fits one agent session. Slices that share no blocker can be built in parallel — mark them.
3. Show the draft as a numbered list — title, blocked by, what a player can do once it's merged — and ask: right granularity? right edges? Iterate until the user approves.
4. Publish in dependency order, blockers first: each an `sdd:build` sub-issue of the spec, with its blocked-by edges.
5. Show the frontier — the tickets buildable now. Stop.

Ticket body:

```markdown
## Parent

<link to the spec>

## What to build

<the end-to-end behaviour, from the player's point of view>

## Acceptance criteria

- [ ] <each one checkable in a browser or by a test>

## Implements

<the user stories and decisions from the spec this ticket covers>
```
