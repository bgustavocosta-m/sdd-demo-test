import type { Player } from '../game/player'
import type { GameState, Mark } from '../game/rules'

export type Players = { X: Player; O: Player }
export type StateMsg = { type: 'state'; players: Players } & GameState

export type Msg =
  | { type: 'join'; name: string; emoji: string }
  | { type: 'move'; cell: number }
  | { type: 'restart' }
  | StateMsg
  | { type: 'room-full' }
  | { type: 'bye' }
  | { type: 'ping' }

type Obj = Record<string, unknown>

const isObj = (x: unknown): x is Obj => typeof x === 'object' && x !== null && !Array.isArray(x)
const isMark = (x: unknown): x is Mark => x === 'X' || x === 'O'
const isStr = (x: unknown): x is string => typeof x === 'string'
const isPlayer = (x: unknown) => isObj(x) && isStr(x.name) && isStr(x.emoji)
const isCellIndex = (x: unknown) => Number.isInteger(x) && (x as number) >= 0 && (x as number) <= 8

function isState(m: Obj): boolean {
  return (
    Array.isArray(m.board) &&
    m.board.length === 9 &&
    m.board.every((c) => c === null || isMark(c)) &&
    isMark(m.turn) &&
    isMark(m.starter) &&
    (m.winner === null || m.winner === 'draw' || isMark(m.winner)) &&
    (m.line === null || (Array.isArray(m.line) && m.line.length === 3 && m.line.every(isCellIndex))) &&
    isObj(m.players) &&
    isPlayer(m.players.X) &&
    isPlayer(m.players.O)
  )
}

/** Guards every incoming message (#4). Unknown or malformed messages return false. */
export function isMsg(x: unknown): x is Msg {
  if (!isObj(x)) return false
  switch (x.type) {
    case 'join':
      return isStr(x.name) && isStr(x.emoji)
    case 'move':
      return typeof x.cell === 'number'
    case 'state':
      return isState(x)
    case 'restart':
    case 'room-full':
    case 'bye':
    case 'ping':
      return true
    default:
      return false
  }
}
