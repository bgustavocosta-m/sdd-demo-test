# AGENTS.md

Online tic-tac-toe with friends: a static React site on GitHub Pages. Two browsers play peer-to-peer over PeerJS/WebRTC, with no backend of our own. Checkers is shown as "coming soon" only.

The plan lives on GitHub Issues. The map is [#1](https://github.com/bgustavocosta-m/sdd-demo-test/issues/1), and every decision has its own closed ticket. **Read the ticket a rule comes from before changing that rule.** The sdd workflow (`.claude/skills/sdd/`) drives the work: chart → resolve → spec → tickets → build.

## Stack

- Vite (react-ts template) + React + TypeScript; Vitest for unit tests. [#3](https://github.com/bgustavocosta-m/sdd-demo-test/issues/3)
- Runtime dependencies are limited to `react`, `react-dom`, `react-router` (v8, `createHashRouter`) and `peerjs@1.5.5`. Add nothing else without a decision ticket.
- `vite.config.ts` sets `base: '/sdd-demo-test/'` and holds the Vitest config. Deployment uses Vite's official GitHub Pages Actions workflow, and that workflow is the first thing cut if time runs short.

## Commands

```sh
npm install
npm run dev        # local dev server
npm test           # vitest
npm run build      # must pass before any PR
```

## Layout

| Path | What |
|---|---|
| `src/game/rules.ts` | Pure rules engine: `initialState(starter)`, `applyMove(state, mark, cell)` (returns `null` for an invalid move), `restart(state)` (flips the starter). No React, no I/O. |
| `src/net/protocol.ts` | The `Msg` union and the `isMsg()` guard ([#4](https://github.com/bgustavocosta-m/sdd-demo-test/issues/4)) |
| `src/net/` | Host and guest connection wrappers around PeerJS ([#2](https://github.com/bgustavocosta-m/sdd-demo-test/issues/2)) |
| `src/pages/` | `/` game picker · `/tic-tac-toe` create room · `/tic-tac-toe/:roomId` room ([#5](https://github.com/bgustavocosta-m/sdd-demo-test/issues/5)) |

## Rules that are easy to get wrong

**Game and roles** ([#5](https://github.com/bgustavocosta-m/sdd-demo-test/issues/5), [#4](https://github.com/bgustavocosta-m/sdd-demo-test/issues/4))
- The host's browser is the only source of truth. The host plays X (❌) and the guest plays O (⭕). X starts the first game, and the starter alternates on every restart.
- The guest **never** changes its board optimistically. It renders the latest `state` snapshot from the host.
- The role comes from router navigation state (`{ role: 'host', name, emoji }`). A room page without that state is a guest page. Never derive the role from the URL.

**Protocol** ([#4](https://github.com/bgustavocosta-m/sdd-demo-test/issues/4))
- Messages are plain JSON with a `type` field: `join{name,emoji}`, `move{cell}`, `restart`, `state{board,turn,starter,players,winner,line}`, `room-full`, `bye`, `ping`. There is no version field.
- The host sends a full `state` after `join`, after every valid move and after every restart.
- Invalid or out-of-turn moves are ignored with a `console.warn`. There is no reject message.
- Every incoming message goes through `isMsg()`. Drop anything unknown or malformed.

**PeerJS** ([#2](https://github.com/bgustavocosta-m/sdd-demo-test/issues/2)). Check the docs or source at tag v1.5.5 before using any API you haven't used here before.
- The room id is the host's peer id: `ttt-` + 10 chars from `[a-z0-9]`, generated with `crypto.getRandomValues`. On `unavailable-id`, generate a new id.
- The guest connects with `{ reliable: true, serialization: 'json' }` and sends only after `conn.on('open')`. Calling `send()` before then drops the message.
- `peer-unavailable` fires on the `peer`, not the `conn`. Show "Room not found" when it does.
- Turn away a third peer like this: after `open`, send `room-full`, then `close({ flush: true })`, plus a fallback `close()` after 1 s.
- Don't rely on `close` alone to notice that the opponent left:
  - send `bye` on Leave and on `pagehide`, then `peer.destroy()`
  - send `ping` every 2 s, and treat about 6 s of silence as "Opponent left"
- Keep the `Peer` outside React StrictMode's mount → unmount → mount cycle, for example with a module-level singleton. Otherwise the second mount gets `unavailable-id`.

**UI**
- Names are trimmed and must be 1–16 characters. The emoji comes from a fixed 12-emoji grid, and both players may pick the same one.

## Out of scope

Don't build any of these:
- checkers gameplay
- accounts, saved games, spectators, chat
- reconnecting after a refresh
- any backend or game library
- custom emoji input, restart confirmation, a waiting-room timeout
- move diffs, protocol versioning, reject replies

## Working conventions

- **Time box: one hour.** If something doesn't fit, cut it and say so rather than rush.
- Pure game logic is written test-first. At minimum, test win lines, draws, invalid and out-of-turn moves, name validation and `isMsg`.
- Make small, focused commits. Each build ticket gets its own worktree and branch (`ticket-<n>-<slug>`), and its PR body starts with `Closes #<n>`.
- Verify networked behaviour with two browser tabs, one hosting and one joining. Show the `npm test` and `npm run build` output in the PR.
