import { Peer } from 'peerjs'
import type { Player } from '../game/player'
import { applyMove, initialState, restart, type GameState } from '../game/rules'
import { link, onPagehide, type GameMsg, type Link } from './link'
import type { Players } from './protocol'
import { createStore } from './store'

export type HostSnapshot =
  | { phase: 'waiting' }
  | { phase: 'playing'; players: Players; game: GameState }
  | { phase: 'opponent-left' }

export type HostSession = {
  roomId: string
  getSnapshot: () => HostSnapshot
  subscribe: (listener: () => void) => () => void
  move: (cell: number) => void
  restart: () => void
  /** Sends `bye` and destroys the Peer. The caller navigates home. */
  leave: () => void
}

/**
 * The host's Peer lives at module level, outside React's StrictMode
 * mount → unmount → mount cycle, so the second mount reuses it instead of
 * registering the same id again and getting `unavailable-id` (#2).
 */
let current: HostSession | null = null

export function getHostSession(roomId: string, me: Player): HostSession {
  if (current?.roomId !== roomId) current = createHostSession(roomId, me)
  return current
}

function createHostSession(roomId: string, me: Player): HostSession {
  const store = createStore<HostSnapshot>({ phase: 'waiting' })
  const peer = new Peer(roomId)
  let guest: Link | null = null

  const bye = () => {
    guest?.send({ type: 'bye' })
    guest?.stop()
    peer.destroy()
  }
  const unlisten = onPagehide(() => guest?.send({ type: 'bye' }), () => peer.destroy())

  const commit = (players: Players, game: GameState) => {
    store.set({ phase: 'playing', players, game })
    guest?.send({ type: 'state', players, ...game })
  }

  const onMessage = (data: GameMsg) => {
    const snap = store.get()
    switch (data.type) {
      case 'join':
        if (snap.phase !== 'waiting') {
          console.warn('Ignored duplicate join')
          return
        }
        commit({ X: me, O: { name: data.name, emoji: data.emoji } }, initialState('X'))
        return
      case 'move': {
        if (snap.phase !== 'playing') {
          console.warn('Ignored move before join')
          return
        }
        const next = applyMove(snap.game, 'O', data.cell)
        if (!next) {
          console.warn('Ignored invalid move', data.cell)
          return
        }
        commit(snap.players, next)
        return
      }
      case 'restart':
        // Applied whenever it arrives, with no confirmation (#5).
        if (snap.phase !== 'playing') {
          console.warn('Ignored restart before join')
          return
        }
        commit(snap.players, restart(snap.game))
        return
      default:
        return
    }
  }

  peer.on('connection', (conn) => {
    // Only the first guest is adopted. Turning away a third peer is #13.
    if (guest) return
    guest = link(conn, onMessage, () => {
      // The room is over: no going back to waiting, and no new guest is adopted.
      store.set({ phase: 'opponent-left' })
      unlisten()
      peer.destroy()
    })
  })
  peer.on('error', (err) => console.warn('PeerJS error', err.type))

  return {
    roomId,
    getSnapshot: store.get,
    subscribe: store.subscribe,
    move(cell) {
      const snap = store.get()
      if (snap.phase !== 'playing') return
      const next = applyMove(snap.game, 'X', cell)
      if (!next) {
        console.warn('Ignored invalid move', cell)
        return
      }
      commit(snap.players, next)
    },
    restart() {
      const snap = store.get()
      if (snap.phase !== 'playing') return
      commit(snap.players, restart(snap.game))
    },
    leave() {
      unlisten()
      bye()
      current = null
    },
  }
}
