import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { peerErrorScreen, turnAway } from './errors'

describe('peerErrorScreen', () => {
  it('maps peer-unavailable to "not-found"', () => {
    expect(peerErrorScreen('peer-unavailable')).toBe('not-found')
  })
  it.each(['network', 'server-error', 'socket-error', 'socket-closed', 'browser-incompatible', 'webrtc'])(
    'maps %s to "connection"',
    (t) => {
      expect(peerErrorScreen(t)).toBe('connection')
    },
  )
  it.each(['unavailable-id', 'disconnected', 'invalid-id', 'whatever'])('returns null for %s', (t) => {
    expect(peerErrorScreen(t)).toBeNull()
  })
})

describe('turnAway', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })
  afterEach(() => {
    vi.useRealTimers()
  })

  function fakeConn(open: boolean) {
    const handlers: Record<string, () => void> = {}
    return {
      open,
      send: vi.fn(),
      close: vi.fn(),
      on: vi.fn((ev: string, fn: () => void) => {
        handlers[ev] = fn
      }),
      fire: (ev: string) => handlers[ev]?.(),
    }
  }

  it('waits for open, then sends room-full and closes with flush', () => {
    const conn = fakeConn(false)
    turnAway(conn)
    expect(conn.send).not.toHaveBeenCalled()
    conn.fire('open')
    expect(conn.send).toHaveBeenCalledWith({ type: 'room-full' })
    expect(conn.close).toHaveBeenCalledWith({ flush: true })
    expect(conn.send.mock.invocationCallOrder[0]).toBeLessThan(conn.close.mock.invocationCallOrder[0])
  })

  it('falls back to a plain close() after 1 s', () => {
    const conn = fakeConn(false)
    turnAway(conn)
    conn.fire('open')
    vi.advanceTimersByTime(999)
    expect(conn.close).toHaveBeenCalledTimes(1)
    vi.advanceTimersByTime(1)
    expect(conn.close).toHaveBeenCalledTimes(2)
    expect(conn.close).toHaveBeenLastCalledWith()
  })

  it('acts at once if the connection is already open', () => {
    const conn = fakeConn(true)
    turnAway(conn)
    expect(conn.send).toHaveBeenCalledWith({ type: 'room-full' })
  })
})
