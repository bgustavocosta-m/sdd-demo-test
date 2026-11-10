import type { GameState, Mark } from '../game/rules'
import type { Players } from '../net/protocol'

const SYMBOL: Record<Mark, string> = { X: '❌', O: '⭕' }

type Props = { players: Players; game: GameState; me: Mark; onCell: (cell: number) => void }

export default function Game({ players, game, me, onCell }: Props) {
  const myTurn = game.turn === me && game.winner === null
  const status = myTurn ? 'Your turn' : `${players[game.turn].name}'s turn`

  return (
    <section className="game">
      <header className="players">
        {(['X', 'O'] as const).map((m) => (
          <div key={m} className={m === game.turn ? 'player active' : 'player'}>
            <span aria-hidden="true">{players[m].emoji}</span> {players[m].name} {SYMBOL[m]}
            {m === me && ' (you)'}
          </div>
        ))}
      </header>
      <p className="status" role="status">
        {status}
      </p>
      <div className="board">
        {game.board.map((cell, i) => (
          <button
            key={i}
            type="button"
            className="cell"
            disabled={!myTurn || cell !== null}
            onClick={() => onCell(i)}
            aria-label={`Cell ${i + 1}${cell ? `: ${cell}` : ''}`}
          >
            {cell && SYMBOL[cell]}
          </button>
        ))}
      </div>
    </section>
  )
}
