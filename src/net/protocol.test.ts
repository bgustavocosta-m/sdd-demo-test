import { describe, it, expect } from 'vitest'
import { isMsg } from './protocol'

const players = { X: { name: 'Ana', emoji: '😀' }, O: { name: 'Bo', emoji: '🐸' } }
const state = {
  type: 'state',
  board: ['X', null, null, null, 'O', null, null, null, null],
  turn: 'X',
  starter: 'X',
  players,
  winner: null,
  line: null,
}

describe('isMsg accepts', () => {
  it.each([
    { type: 'join', name: 'Ana', emoji: '😀' },
    { type: 'move', cell: 4 },
    { type: 'restart' },
    state,
    { ...state, winner: 'X', line: [0, 1, 2] },
    { ...state, winner: 'draw' },
    { type: 'room-full' },
    { type: 'bye' },
    { type: 'ping' },
  ])('%j', (m) => {
    expect(isMsg(m)).toBe(true)
  })
})

describe('isMsg rejects', () => {
  it.each([
    null,
    undefined,
    42,
    'move',
    [],
    {},
    { type: 'nope' },
    { type: 'join', name: 'Ana' },
    { type: 'join', name: 1, emoji: '😀' },
    { type: 'move' },
    { type: 'move', cell: '4' },
    { ...state, board: state.board.slice(0, 8) },
    { ...state, board: [...state.board.slice(0, 8), 'Z'] },
    { ...state, turn: 'Z' },
    { ...state, starter: undefined },
    { ...state, players: undefined },
    { ...state, players: { X: players.X } },
    { ...state, players: { X: players.X, O: { name: 'Bo' } } },
    { ...state, winner: 'Y' },
    { ...state, line: [0, 1] },
    { ...state, line: undefined },
  ])('%j', (m) => {
    expect(isMsg(m)).toBe(false)
  })
})
