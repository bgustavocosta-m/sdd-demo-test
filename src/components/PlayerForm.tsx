import { useState, type FormEvent } from 'react'
import { EMOJIS, MAX_NAME, validateName, type Player } from '../game/player'

type Props = { submitLabel: string; onSubmit: (player: Player) => void }

export default function PlayerForm({ submitLabel, onSubmit }: Props) {
  const [name, setName] = useState('')
  const [emoji, setEmoji] = useState<string>(EMOJIS[0])
  const valid = validateName(name)

  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (valid) onSubmit({ name: valid, emoji })
  }

  return (
    <form className="player-form" onSubmit={submit}>
      <label>
        Your name
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={`1–${MAX_NAME} characters`}
          autoFocus
        />
      </label>
      <fieldset className="emoji-grid">
        <legend>Pick an emoji</legend>
        {EMOJIS.map((e) => (
          <label key={e} className={e === emoji ? 'selected' : undefined}>
            <input type="radio" name="emoji" value={e} checked={e === emoji} onChange={() => setEmoji(e)} />
            {e}
          </label>
        ))}
      </fieldset>
      <button type="submit" disabled={!valid}>
        {submitLabel}
      </button>
    </form>
  )
}
