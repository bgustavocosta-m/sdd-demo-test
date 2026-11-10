import type { Msg } from './protocol'

export type ErrorScreen = 'not-found' | 'room-full' | 'connection'

const CONNECTION_ERRORS = new Set([
  'network',
  'server-error',
  'socket-error',
  'socket-closed',
  'browser-incompatible',
  'webrtc',
])

/**
 * Maps a PeerJS error type to the screen it shows. `peer-unavailable` fires on
 * the `peer`, not the `conn`, and means "Room not found" (#2). `unavailable-id`
 * is handled by the host itself, and anything else is only logged.
 */
export function peerErrorScreen(type: string): Exclude<ErrorScreen, 'room-full'> | null {
  if (type === 'peer-unavailable') return 'not-found'
  if (CONNECTION_ERRORS.has(type)) return 'connection'
  return null
}

type Closable = {
  open: boolean
  send: (msg: Msg) => void
  close: (options?: { flush?: boolean }) => void
  on: (event: 'open', fn: () => void) => unknown
}

/**
 * Turns away a third peer (#2): after `open`, send `room-full`, then
 * `close({ flush: true })`, plus a fallback `close()` after 1 s.
 */
export function turnAway(conn: Closable): void {
  const go = () => {
    conn.send({ type: 'room-full' })
    conn.close({ flush: true })
    setTimeout(() => conn.close(), 1000)
  }
  if (conn.open) go()
  else conn.on('open', go)
}
