export type Mark = 'X' | 'O'
export type Cell = Mark | null
export type Line = [number, number, number]

export type GameState = {
  board: Cell[] // length 9
  turn: Mark
  starter: Mark
  winner: Mark | 'draw' | null
  line: Line | null
}

export const LINES: readonly Line[] = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
]

export const other =(m: Mark): Mark => (m === 'X' ? 'O' : 'X')

export function initialState(starter: Mark): GameState {
  return { board: Array(9).fill(null), turn: starter, starter, winner: null, line: null }
}

/** Returns the next state, or `null` if the move is invalid (out of turn, occupied, out of range, game over). */
export function applyMove(state: GameState, mark: Mark, cell: number): GameState | null {
  if (state.winner !== null) return null
  if (mark !== state.turn) return null
  if (!Number.isInteger(cell) || cell < 0 || cell > 8) return null
  if (state.board[cell] !== null) return null
  const board = state.board.slice()
  board[cell] = mark
  const line = LINES.find((l) => l.every((c) => board[c] === mark)) ?? null
  const winner = line ? mark : board.every((c) => c !== null) ? 'draw' : null
  return { ...state, board, turn: other(mark), winner, line }
}

/** A fresh board for the next game; the starter alternates on every restart (#4). */
export function restart(state: GameState): GameState {
  return initialState(other(state.starter))
}
