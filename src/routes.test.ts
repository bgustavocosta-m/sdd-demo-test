import { describe, it, expect } from 'vitest'
import { matchRoutes } from 'react-router'
import { routes } from './routes'

describe('routes', () => {
  it('matches the three app paths', () => {
    expect(matchRoutes(routes, '/')?.at(-1)?.route.path).toBe('/')
    expect(matchRoutes(routes, '/tic-tac-toe')?.at(-1)?.route.path).toBe('/tic-tac-toe')
    const room = matchRoutes(routes, '/tic-tac-toe/anything')?.at(-1)
    expect(room?.route.path).toBe('/tic-tac-toe/:roomId')
    expect(room?.params.roomId).toBe('anything')
  })
})
