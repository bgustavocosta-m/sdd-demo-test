import { describe, it, expect } from 'vitest'
import { EMOJIS, validateName } from './player'

describe('validateName', () => {
  it('trims the name', () => {
    expect(validateName('  Ana  ')).toBe('Ana')
  })
  it('rejects empty and whitespace-only names', () => {
    expect(validateName('')).toBeNull()
    expect(validateName('   ')).toBeNull()
  })
  it('accepts 1 and 16 characters', () => {
    expect(validateName('a')).toBe('a')
    expect(validateName('a'.repeat(16))).toBe('a'.repeat(16))
  })
  it('rejects 17 characters', () => {
    expect(validateName('a'.repeat(17))).toBeNull()
  })
  it('measures length after trimming', () => {
    expect(validateName(` ${'a'.repeat(16)} `)).toBe('a'.repeat(16))
  })
})

describe('EMOJIS', () => {
  it('is the fixed 12-emoji grid', () => {
    expect(EMOJIS).toEqual(['😀', '😎', '🤖', '👻', '🐱', '🐶', '🦊', '🐸', '🐼', '🦄', '🐙', '🌵'])
  })
})
