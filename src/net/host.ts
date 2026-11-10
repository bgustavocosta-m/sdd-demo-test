import { Peer } from 'peerjs'
import type { Player } from '../game/player'
import { applyMove, initialState, restart, type GameState } from '../game/rules'
import { peerErrorScreen, turnAway, type ErrorScreen } from './errors'
import { link, onPagehide, type GameMsg, type Link } from './link'
import type { Players } from './protocol'
import { newRoomId } from './roomId'
import { createStore } from './store'

export type HostSnapshot =
  | { phase: 'waiting' }
  | { phase: 'playing'; players: Players; game: GameState }
  | { phase: 'opponent-left' }
  | { phase: 'error'; screen: ErrorScreen }
  /** The room id was taken on the broker; the page moves to `nextRoomId` (#2). */
  | { phase: 'id-taken'; nextRoomId: string }

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

  /** Moves to a final screen once; later errors or closes can't overwrite it. */
  const end = (snap: Exclude<HostSnapshot, { phase: 'waiting' | 'playing' }>) => {
    const phase = store.get().phase
    if (phase !== 'waiting' && phase !== 'playing') return
    guest?.stop()
    unlisten()
    peer.destroy()
    store.set(snap)
  }

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
    // Only the first guest is adopted; anyone after that gets `room-full` (#2).
    if (guest) {
      turnAway(conn)
      return
    }
    // The room is over: no going back to waiting, and no new guest is adopted.
    guest = link(conn, onMessage, () => end({ phase: 'opponent-left' }))
  })
  peer.on('error', (err) => {
    console.warn('PeerJS error', err.type)
    if (err.type === 'unavailable-id') {
      end({ phase: 'id-taken', nextRoomId: newRoomId() })
      return
    }
    const screen = peerErrorScreen(err.type)
    if (screen) end({ phase: 'error', screen })
  })

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
