import { describe, it, expect } from 'vitest'
import { applyMove, initialState } from './rules'

describe('initialState', () => {
  it('has an empty board and the starter to move', () => {
    const s = initialState('X')
    expect(s.board).toEqual(Array(9).fill(null))
    expect(s.turn).toBe('X')
    expect(s.starter).toBe('X')
    expect(s.winner).toBeNull()
    expect(s.line).toBeNull()
  })
})

describe('applyMove', () => {
  it('places the mark and alternates turns', () => {
    const a = applyMove(initialState('X'), 'X', 4)!
    expect(a.board[4]).toBe('X')
    expect(a.turn).toBe('O')
    const b = applyMove(a, 'O', 0)!
    expect(b.board[0]).toBe('O')
    expect(b.turn).toBe('X')
  })
  it('does not mutate the input state', () => {
    const s = initialState('X')
    applyMove(s, 'X', 4)
    expect(s.board[4]).toBeNull()
  })
  it('returns null for an occupied cell', () => {
    const a = applyMove(initialState('X'), 'X', 4)!
    expect(applyMove(a, 'O', 4)).toBeNull()
  })
  it('returns null for an out-of-range cell', () => {
    const s = initialState('X')
    expect(applyMove(s, 'X', -1)).toBeNull()
    expect(applyMove(s, 'X', 9)).toBeNull()
    expect(applyMove(s, 'X', 1.5)).toBeNull()
  })
  it('returns null for an out-of-turn move', () => {
    expect(applyMove(initialState('X'), 'O', 0)).toBeNull()
  })
})
