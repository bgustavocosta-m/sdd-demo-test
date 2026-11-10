import { useState, useSyncExternalStore } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router'
import Game from '../components/Game'
import PlayerForm from '../components/PlayerForm'
import type { Player } from '../game/player'
import { joinRoom, type GuestSession } from '../net/guest'
import { getHostSession, type HostSession } from '../net/host'

/** The role comes only from navigation state, never the URL (#5). */
function hostState(state: unknown): Player | null {
  if (typeof state !== 'object' || state === null) return null
  const s = state as Record<string, unknown>
  if (s.role !== 'host' || typeof s.name !== 'string' || typeof s.emoji !== 'string') return null
  return { name: s.name, emoji: s.emoji }
}

export default function Room() {
  const { roomId = '' } = useParams()
  const me = hostState(useLocation().state)
  return (
    <main className="room">
      {me ? <HostRoom key={roomId} roomId={roomId} me={me} /> : <GuestRoom key={roomId} roomId={roomId} />}
    </main>
  )
}

function HostRoom({ roomId, me }: { roomId: string; me: Player }) {
  // Idempotent module-level singleton, safe under StrictMode's double render/mount.
  const session: HostSession = getHostSession(roomId, me)
  const snap = useSyncExternalStore(session.subscribe, session.getSnapshot)
  const leave = useLeave(session.leave)
  if (snap.phase === 'waiting') return <Waiting roomId={roomId} onLeave={leave} />
  if (snap.phase === 'opponent-left') return <OpponentLeft />
  return (
    <Game
      players={snap.players}
      game={snap.game}
      me="X"
      onCell={session.move}
      onRestart={session.restart}
      onLeave={leave}
    />
  )
}

/** Leave sends `bye`, destroys the Peer and goes home (#5). */
function useLeave(leave: () => void) {
  const navigate = useNavigate()
  return () => {
    leave()
    navigate('/')
  }
}

function OpponentLeft() {
  return (
    <section className="opponent-left">
      <h1>Opponent left</h1>
      <p>
        <Link to="/">Back home</Link>
      </p>
    </section>
  )
}

function Waiting({ roomId, onLeave }: { roomId: string; onLeave: () => void }) {
  const link = location.origin + location.pathname + '#/tic-tac-toe/' + roomId
  const [copied, setCopied] = useState(false)
  const copy = () => {
    navigator.clipboard.writeText(link).then(
      () => setCopied(true),
      () => setCopied(false),
    )
  }
  return (
    <section className="waiting">
      <h1>Waiting for a friend…</h1>
      <p>Send them this link:</p>
      <p className="share-link">
        <code>{link}</code>
      </p>
      <button type="button" onClick={copy}>
        {copied ? 'Copied!' : 'Copy'}
      </button>{' '}
      <button type="button" onClick={onLeave}>
        Leave
      </button>
    </section>
  )
}

function GuestRoom({ roomId }: { roomId: string }) {
  const [session, setSession] = useState<GuestSession | null>(null)
  if (!session) {
    return (
      <>
        <h1>Join room</h1>
        <PlayerForm submitLabel="Join room" onSubmit={(player) => setSession(joinRoom(roomId, player))} />
      </>
    )
  }
  return <GuestGame session={session} />
}

function GuestGame({ session }: { session: GuestSession }) {
  const snap = useSyncExternalStore(session.subscribe, session.getSnapshot)
  const leave = useLeave(session.leave)
  if (snap.phase === 'connecting') return <p className="status">Connecting…</p>
  if (snap.phase === 'opponent-left') return <OpponentLeft />
  return (
    <Game
      players={snap.state.players}
      game={snap.state}
      me="O"
      onCell={session.move}
      onRestart={session.restart}
      onLeave={leave}
    />
  )
}
