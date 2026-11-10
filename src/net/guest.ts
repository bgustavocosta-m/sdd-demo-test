import { Peer } from 'peerjs'
import type { Player } from '../game/player'
import { peerErrorScreen, type ErrorScreen } from './errors'
import { link, onPagehide, type Link } from './link'
import type { StateMsg } from './protocol'
import { createStore } from './store'

export type GuestSnapshot =
  | { phase: 'connecting' }
  | { phase: 'playing'; state: StateMsg }
  | { phase: 'opponent-left' }
  | { phase: 'error'; screen: ErrorScreen }

export type GuestSession = {
  roomId: string
  getSnapshot: () => GuestSnapshot
  subscribe: (listener: () => void) => () => void
  move: (cell: number) => void
  restart: () => void
  /** Sends `bye` and destroys the Peer. The caller navigates home. */
  leave: () => void
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
  let host: Link | null = null
  const unlisten = onPagehide(() => host?.send({ type: 'bye' }), () => peer.destroy())

  /** Moves to a final screen once; later errors or closes can't overwrite it. */
  const end = (snap: Exclude<GuestSnapshot, { phase: 'connecting' | 'playing' }>) => {
    const phase = store.get().phase
    if (phase !== 'connecting' && phase !== 'playing') return
    host?.stop()
    unlisten()
    peer.destroy()
    if (current?.getSnapshot === store.get) current = null
    store.set(snap)
  }

  peer.on('open', () => {
    const conn = peer.connect(roomId, { reliable: true, serialization: 'json' })
    // link() only sends on an open channel; send() before 'open' drops the message (#2).
    conn.on('open', () => host?.send({ type: 'join', name: me.name, emoji: me.emoji }))
    host = link(
      conn,
      (msg) => {
        // The guest never changes its board itself; it renders the host's snapshot (#4).
        if (msg.type === 'state') store.set({ phase: 'playing', state: msg })
        else if (msg.type === 'room-full') end({ phase: 'error', screen: 'room-full' })
      },
      () => end({ phase: 'opponent-left' }),
    )
  })
  // `peer-unavailable` fires here on the peer, not on the conn (#2).
  peer.on('error', (err) => {
    console.warn('PeerJS error', err.type)
    const screen = peerErrorScreen(err.type)
    if (screen) end({ phase: 'error', screen })
  })

  return {
    roomId,
    getSnapshot: store.get,
    subscribe: store.subscribe,
    move: (cell) => host?.send({ type: 'move', cell }),
    // Only asks; the board resets when the host's new state arrives (#4).
    restart: () => host?.send({ type: 'restart' }),
    leave() {
      unlisten()
      host?.send({ type: 'bye' })
      host?.stop()
      peer.destroy()
      current = null
    },
  }
}
