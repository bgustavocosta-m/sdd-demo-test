---
name: sdd
description: Spec-driven development on GitHub Issues — chart the decisions, resolve them, write the spec, slice it into tickets, build them. Picks the next phase from the tracker and runs it.
disable-model-invocation: true
---

Take an idea to working code through five phases, every artifact a linked GitHub issue:

**chart → resolve → spec → tickets → build**

GitHub is the state. Each run does **one phase** (for resolve and build: one ticket), records the outcome on GitHub, and stops. The next run reads GitHub to find where it is, so a fresh session between runs loses nothing.

Each phase is also its own skill (`/sdd-chart`, `/sdd-resolve`, `/sdd-spec`, `/sdd-tickets`, `/sdd-build`) for jumping straight to it. All of them share [conventions.md](conventions.md).

## Find the phase

If the user named a phase or an issue, go there. Otherwise read the tracker and take the first row that matches:

| Tracker state                                  | Phase                                  |
| ---------------------------------------------- | -------------------------------------- |
| No open `sdd:map` issue                        | [chart](../sdd-chart/SKILL.md)         |
| The map has an open decision ticket            | [resolve](../sdd-resolve/SKILL.md)     |
| No `sdd:spec` issue                            | [spec](../sdd-spec/SKILL.md)           |
| The spec has no sub-issues                     | [tickets](../sdd-tickets/SKILL.md)     |
| The spec has an open `sdd:build` ticket        | [build](../sdd-build/SKILL.md)         |
| Everything closed                              | close the spec and map, report         |

Tell the user the phase and the row that picked it, in one line. Then read [conventions.md](conventions.md) and that phase's file — only that one — and follow it.
