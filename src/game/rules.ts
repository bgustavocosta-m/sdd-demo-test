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

export const other = (m: Mark): Mark => (m === 'X' ? 'O' : 'X')

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
  return { ...state, board, turn: other(mark) }
}
