export const PING_MS = 2000
export const SILENCE_MS = 6000

export type Heartbeat = { seen: () => void; stop: () => void }

/**
 * PeerJS `close` alone doesn't reliably say the opponent left (#2), so each
 * side pings every 2 s and treats 6 s without any message as the opponent gone.
 * Call `seen()` on every received message. `onSilence` fires at most once.
 */
export function heartbeat(send: () => void, onSilence: () => void): Heartbeat {
  const pinger = setInterval(send, PING_MS)
  let silence: ReturnType<typeof setTimeout> | undefined

  const stop = () => {
    clearInterval(pinger)
    clearTimeout(silence)
  }
  const seen = () => {
    clearTimeout(silence)
    silence = setTimeout(() => {
      stop()
      onSilence()
    }, SILENCE_MS)
  }

  seen()
  return { seen, stop }
}
