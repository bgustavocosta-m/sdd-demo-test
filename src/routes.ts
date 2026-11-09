import type { RouteObject } from 'react-router'
import GamePicker from './pages/GamePicker'
import CreateRoom from './pages/CreateRoom'
import Room from './pages/Room'

export const routes: RouteObject[] = [
  { path: '/', Component: GamePicker },
  { path: '/tic-tac-toe', Component: CreateRoom },
  { path: '/tic-tac-toe/:roomId', Component: Room },
]
