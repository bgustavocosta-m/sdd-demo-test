import type { DataConnection } from 'peerjs'
import { heartbeat, type Heartbeat } from './heartbeat'
import { isMsg, type Msg } from './protocol'

/** Game messages the sessions handle themselves; `ping` and `bye` stay in here. */
export type GameMsg = Exclude<Msg, { type: 'ping' } | { type: 'bye' }>

export type Link = { send: (msg: Msg) => void; stop: () => void }

/**
 * Wraps the one opponent connection. Every incoming message goes through
 * `isMsg()` and counts as `seen()`. The opponent is gone on `bye`, a `conn`
 * `close`, or 6 s of silence, because `close` alone isn't reliable (#2).
 * `onGone` fires at most once, and never after `stop()`.
 */
export function link(conn: DataConnection, onMsg: (msg: GameMsg) => void, onGone: () => void): Link {
  let hb: Heartbeat | null = null
  let done = false

  // send() before 'open' drops the message, so only send on an open channel (#2).
  const send = (msg: Msg) => {
    if (conn.open) conn.send(msg)
  }
  const stop = () => {
    done = true
    hb?.stop()
  }
  const gone = () => {
    if (done) return
    stop()
    onGone()
  }

  const start = () => {
    if (!done && !hb) hb = heartbeat(() => send({ type: 'ping' }), gone)
  }
  if (conn.open) start()
  else conn.on('open', start)

  conn.on('data', (data) => {
    if (done) return
    hb?.seen()
    if (!isMsg(data)) {
      console.warn('Dropped malformed message', data)
      return
    }
    if (data.type === 'bye') gone()
    else if (data.type !== 'ping') onMsg(data)
  })
  conn.on('close', gone)

  return { send, stop }
}

/**
 * Sends `bye` on `pagehide` until the returned function is called. Calls
 * `onHide` after the bye so the caller can destroy its Peer (#2).
 */
export function onPagehide(sendBye: () => void, onHide: () => void): () => void {
  const handler = () => {
    sendBye()
    onHide()
  }
  window.addEventListener('pagehide', handler)
  return () => window.removeEventListener('pagehide', handler)
}
