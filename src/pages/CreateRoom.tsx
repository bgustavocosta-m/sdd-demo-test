import { useNavigate } from 'react-router'
import PlayerForm from '../components/PlayerForm'
import { newRoomId } from '../net/roomId'

export default function CreateRoom() {
  const navigate = useNavigate()
  return (
    <main className="create-room">
      <h1>Tic-tac-toe</h1>
      <PlayerForm
        submitLabel="Create room"
        onSubmit={({ name, emoji }) =>
          navigate(`/tic-tac-toe/${newRoomId()}`, { state: { role: 'host', name, emoji } })
        }
      />
    </main>
  )
}
