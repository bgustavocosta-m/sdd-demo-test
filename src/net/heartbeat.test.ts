import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { heartbeat } from './heartbeat'

beforeEach(() => {
  vi.useFakeTimers()
})
afterEach(() => {
  vi.useRealTimers()
})

describe('heartbeat', () => {
  it('calls send every 2000 ms', () => {
    const send = vi.fn()
    const hb = heartbeat(send, vi.fn())
    expect(send).not.toHaveBeenCalled()
    vi.advanceTimersByTime(1999)
    expect(send).toHaveBeenCalledTimes(0)
    vi.advanceTimersByTime(1)
    expect(send).toHaveBeenCalledTimes(1)
    for (let i = 0; i < 4; i++) {
      hb.seen()
      vi.advanceTimersByTime(2000)
    }
    expect(send).toHaveBeenCalledTimes(5)
    hb.stop()
  })

  it('calls onSilence after 6000 ms with no seen()', () => {
    const onSilence = vi.fn()
    const hb = heartbeat(vi.fn(), onSilence)
    vi.advanceTimersByTime(5999)
    expect(onSilence).not.toHaveBeenCalled()
    vi.advanceTimersByTime(1)
    expect(onSilence).toHaveBeenCalledTimes(1)
    hb.stop()
  })

  it('calls onSilence only once', () => {
    const onSilence = vi.fn()
    const hb = heartbeat(vi.fn(), onSilence)
    vi.advanceTimersByTime(30000)
    expect(onSilence).toHaveBeenCalledTimes(1)
    hb.stop()
  })

  it('holds off while seen() keeps being called', () => {
    const onSilence = vi.fn()
    const hb = heartbeat(vi.fn(), onSilence)
    for (let i = 0; i < 10; i++) {
      vi.advanceTimersByTime(5000)
      hb.seen()
    }
    expect(onSilence).not.toHaveBeenCalled()
    vi.advanceTimersByTime(6000)
    expect(onSilence).toHaveBeenCalledTimes(1)
    hb.stop()
  })

  it('stop() stops both sending and the silence timer', () => {
    const send = vi.fn()
    const onSilence = vi.fn()
    const hb = heartbeat(send, onSilence)
    vi.advanceTimersByTime(2000)
    hb.stop()
    vi.advanceTimersByTime(30000)
    expect(send).toHaveBeenCalledTimes(1)
    expect(onSilence).not.toHaveBeenCalled()
  })
})
