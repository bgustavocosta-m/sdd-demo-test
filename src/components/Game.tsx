import type { GameState, Mark } from '../game/rules'
import type { Players } from '../net/protocol'

const SYMBOL: Record<Mark, string> = { X: '❌', O: '⭕' }

type Props = {
  players: Players
  game: GameState
  me: Mark
  onCell: (cell: number) => void
  onRestart: () => void
}

/** Status line from this player's point of view (#5). */
function statusText(game: GameState, players: Players, me: Mark): string {
  if (game.winner === 'draw') return 'Draw'
  if (game.winner) return game.winner === me ? 'You win!' : `${players[game.winner].name} wins!`
  return game.turn === me ? 'Your turn' : `${players[game.turn].name}'s turn`
}

export default function Game({ players, game, me, onCell, onRestart }: Props) {
  const over = game.winner !== null
  const myTurn = game.turn === me && !over

  return (
    <section className="game">
      <header className="players">
        {(['X', 'O'] as const).map((m) => (
          <div key={m} className={!over && m === game.turn ? 'player active' : 'player'}>
            <span aria-hidden="true">{players[m].emoji}</span> {players[m].name} {SYMBOL[m]}
            {m === me && ' (you)'}
          </div>
        ))}
      </header>
      <p className="status" role="status">
        {statusText(game, players, me)}
      </p>
      <div className={over ? 'board over' : 'board'}>
        {game.board.map((cell, i) => (
          <button
            key={i}
            type="button"
            className={game.line?.includes(i) ? 'cell win' : 'cell'}
            disabled={!myTurn || cell !== null}
            onClick={() => onCell(i)}
            aria-label={`Cell ${i + 1}${cell ? `: ${cell}` : ''}`}
          >
            {cell && SYMBOL[cell]}
          </button>
        ))}
      </div>
      {over && (
        <p className="actions">
          <button type="button" onClick={onRestart}>
            Play again
          </button>
        </p>
      )}
    </section>
  )
}
