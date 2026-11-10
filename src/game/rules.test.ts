import { describe, it, expect } from 'vitest'
import { applyMove, initialState, restart, LINES, type GameState, type Line, type Mark } from './rules'

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

/** Plays the cells in order, each by whoever is to move; throws if any move is rejected. */
function play(cells: number[], starter: Mark = 'X'): GameState {
  return cells.reduce<GameState>((s, cell) => {
    const next = applyMove(s, s.turn, cell)
    if (!next) throw new Error(`move ${cell} rejected`)
    return next
  }, initialState(starter))
}

/** X plays `line`; O (with only two marks, so it can't win) plays the first two cells off it. */
function xWinsOn(line: Line): GameState {
  const [o1, o2] = [0, 1, 2, 3, 4, 5, 6, 7, 8].filter((c) => !line.includes(c))
  return play([line[0], o1, line[1], o2, line[2]])
}

const ALL_LINES: Line[] = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
]

describe('wins', () => {
  it('knows exactly the 8 lines', () => {
    expect([...LINES].sort()).toEqual([...ALL_LINES].sort())
  })
  it.each(ALL_LINES)('detects a win on [%i, %i, %i] with the correct line', (...line) => {
    const s = xWinsOn(line as Line)
    expect(s.winner).toBe('X')
    expect(s.line).toEqual(line)
  })
  it('detects a win for O', () => {
    // X: 0, 1, 6   O: 3, 4, 5
    const s = play([0, 3, 1, 4, 6, 5])
    expect(s.winner).toBe('O')
    expect(s.line).toEqual([3, 4, 5])
  })
  it('has no winner mid-game', () => {
    const s = play([0, 4])
    expect(s.winner).toBeNull()
    expect(s.line).toBeNull()
  })
})

describe('draw', () => {
  it('is a draw on a full board with no line', () => {
    // X O X / X O O / O X X
    const s = play([0, 1, 2, 4, 3, 5, 7, 6, 8])
    expect(s.board.every((c) => c !== null)).toBe(true)
    expect(s.winner).toBe('draw')
    expect(s.line).toBeNull()
  })
  it('is a win, not a draw, when the ninth move completes a line', () => {
    // X O X / O O X / O X X — X's last move at 8 completes 2-5-8
    const s = play([0, 1, 2, 3, 5, 4, 7, 6, 8])
    expect(s.winner).toBe('X')
    expect(s.line).toEqual([2, 5, 8])
  })
})

describe('game over', () => {
  it('applyMove returns null after a win', () => {
    const s = xWinsOn([0, 1, 2])
    expect(applyMove(s, s.turn, 8)).toBeNull()
    expect(applyMove(s, 'X', 8)).toBeNull()
  })
  it('applyMove returns null after a draw', () => {
    const s = play([0, 1, 2, 4, 3, 5, 7, 6, 8])
    expect(applyMove(s, 'O', 0)).toBeNull()
    expect(applyMove(s, 'X', 0)).toBeNull()
  })
})

describe('restart', () => {
  it('clears the board and flips starter and turn', () => {
    const r = restart(xWinsOn([0, 1, 2]))
    expect(r.board).toEqual(Array(9).fill(null))
    expect(r.starter).toBe('O')
    expect(r.turn).toBe('O')
    expect(r.winner).toBeNull()
    expect(r.line).toBeNull()
  })
  it('alternates the starter on every restart', () => {
    const r2 = restart(restart(initialState('X')))
    expect(r2.starter).toBe('X')
    expect(r2.turn).toBe('X')
  })
  it('flips from the starter, not from whoever is to move', () => {
    const r = restart(play([4])) // X started, O to move
    expect(r.starter).toBe('O')
    expect(r.turn).toBe('O')
  })
})
