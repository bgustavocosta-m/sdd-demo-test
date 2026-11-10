import { Peer, type DataConnection } from 'peerjs'
import type { Player } from '../game/player'
import { applyMove, initialState, type GameState } from '../game/rules'
import { isMsg, type Msg, type Players } from './protocol'
import { createStore } from './store'

export type HostSnapshot =
  | { phase: 'waiting' }
  | { phase: 'playing'; players: Players; game: GameState }

export type HostSession = {
  roomId: string
  getSnapshot: () => HostSnapshot
  subscribe: (listener: () => void) => () => void
  move: (cell: number) => void
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
  let guest: DataConnection | null = null

  const send = (msg: Msg) => {
    if (guest?.open) guest.send(msg)
  }

  const commit = (players: Players, game: GameState) => {
    store.set({ phase: 'playing', players, game })
    send({ type: 'state', players, ...game })
  }

  const onMessage = (data: unknown) => {
    if (!isMsg(data)) {
      console.warn('Dropped malformed message', data)
      return
    }
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
      default:
        return
    }
  }

  peer.on('connection', (conn) => {
    // Only the first guest is adopted. Turning away a third peer is #13.
    if (guest) return
    guest = conn
    conn.on('data', onMessage)
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
  }
}
