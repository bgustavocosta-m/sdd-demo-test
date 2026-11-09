---
name: sdd-spec
description: SDD phase 3 — collapse the map and resolved decision tickets into one sdd:spec issue.
disable-model-invocation: true
---

# Spec

Part of the [sdd](../sdd/SKILL.md) workflow. Read [conventions.md](../sdd/conventions.md) first — the issue graph, GitHub operations, worktrees and grilling format it describes apply here.

Collapse the map into one spec. Every decision is already made; this phase synthesises, it doesn't ask.

1. Read the map and every closed decision ticket with its resolution comment.
2. Write the spec from the template. Every line of Decisions so far lands in it, linked to its ticket. Anything no ticket decided goes under Assumptions, stated as the default you picked.
3. Publish it as `sdd:spec`: a sub-issue of the map, blocked by every decision ticket.
4. Give the user the link to read it and apply their corrections. Stop.

Spec body:

```markdown
## Problem

## Solution

<from the player's point of view>

## User stories

<numbered: As a <actor>, I want <capability>, so that <benefit>>

## Decisions

<one line each, linking the ticket it came from>

## Modules

<each module, its interface, and whether it's pure logic or touches the DOM / network>

## Testing

<what's tested, at which module boundary, with which tool>

## Out of scope

## Assumptions
```
