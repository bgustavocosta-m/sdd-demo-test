import { Link } from 'react-router'

export default function Home() {
  return (
    <main className="home">
      <h1>Pick a game</h1>
      <div className="game-cards">
        <Link className="game-card" to="/tic-tac-toe">
          <span className="game-card-icon" aria-hidden="true">❌⭕</span>
          <h2>Tic-tac-toe</h2>
          <p>Play a friend online</p>
        </Link>
        <button className="game-card" type="button" disabled>
          <span className="game-card-icon" aria-hidden="true">⚫🔴</span>
          <h2>Checkers</h2>
          <p>coming soon</p>
        </button>
      </div>
    </main>
  )
}
