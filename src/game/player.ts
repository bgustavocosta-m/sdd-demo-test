export type Player = { name: string; emoji: string }

export const EMOJIS = ['😀', '😎', '🤖', '👻', '🐱', '🐶', '🦊', '🐸', '🐼', '🦄', '🐙', '🌵'] as const

export const MAX_NAME = 16

/** Returns the trimmed name if it is 1–16 characters, otherwise `null`. */
export function validateName(raw: string): string | null {
  const name = raw.trim()
  const length = [...name].length
  return length >= 1 && length <= MAX_NAME ? name : null
}
