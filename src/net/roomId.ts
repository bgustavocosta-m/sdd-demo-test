const ALPHABET = 'abcdefghijklmnopqrstuvwxyz0123456789'

/** A room id is the host's peer id: `ttt-` + 10 chars from [a-z0-9] (#2). */
export function newRoomId(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(10))
  return 'ttt-' + Array.from(bytes, (b) => ALPHABET[b % ALPHABET.length]).join('')
}
