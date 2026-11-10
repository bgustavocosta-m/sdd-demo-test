import { Peer, type DataConnection } from 'peerjs'
import type { Player } from '../game/player'
import { isMsg, type Msg, type StateMsg } from './protocol'
import { createStore } from './store'

export type GuestSnapshot = { phase: 'connecting' } | { phase: 'playing'; state: StateMsg }

export type GuestSession = {
  roomId: string
  getSnapshot: () => GuestSnapshot
  subscribe: (listener: () => void) => () => void
  move: (cell: number) => void
  restart: () => void
}

let current: GuestSession | null = null

/** Called on Join submit only, never on page load (#5). */
export function joinRoom(roomId: string, me: Player): GuestSession {
  if (current?.roomId !== roomId) current = createGuestSession(roomId, me)
  return current
}

function createGuestSession(roomId: string, me: Player): GuestSession {
  const store = createStore<GuestSnapshot>({ phase: 'connecting' })
  const peer = new Peer()
  let conn: DataConnection | null = null

  // send() before 'open' drops the message, so only send on an open channel (#2).
  const send = (msg: Msg) => {
    if (conn?.open) conn.send(msg)
  }

  peer.on('open', () => {
    conn = peer.connect(roomId, { reliable: true, serialization: 'json' })
    conn.on('open', () => send({ type: 'join', name: me.name, emoji: me.emoji }))
    conn.on('data', (data) => {
      if (!isMsg(data)) {
        console.warn('Dropped malformed message', data)
        return
      }
      // The guest never changes its board itself; it renders the host's snapshot (#4).
      if (data.type === 'state') store.set({ phase: 'playing', state: data })
    })
  })
  peer.on('error', (err) => console.warn('PeerJS error', err.type))

  return {
    roomId,
    getSnapshot: store.get,
    subscribe: store.subscribe,
    move: (cell) => send({ type: 'move', cell }),
    // Only asks; the board resets when the host's new state arrives (#4).
    restart: () => send({ type: 'restart' }),
  }
}
