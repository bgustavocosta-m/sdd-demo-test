import { describe, it, expect, vi, afterEach } from 'vitest'
import { newRoomId } from './roomId'

afterEach(() => {
  vi.restoreAllMocks()
})

describe('newRoomId', () => {
  it('matches ttt- plus 10 chars from [a-z0-9]', () => {
    for (let i = 0; i < 50; i++) expect(newRoomId()).toMatch(/^ttt-[a-z0-9]{10}$/)
  })
  it('returns a different id each call', () => {
    expect(newRoomId()).not.toBe(newRoomId())
  })
  it('uses crypto.getRandomValues', () => {
    const spy = vi.spyOn(crypto, 'getRandomValues')
    newRoomId()
    expect(spy).toHaveBeenCalled()
  })
})
