import type { RouteObject } from 'react-router'
import Home from './pages/Home'
import CreateRoom from './pages/CreateRoom'
import Room from './pages/Room'

export const routes: RouteObject[] = [
  { path: '/', Component: Home },
  { path: '/tic-tac-toe', Component: CreateRoom },
  { path: '/tic-tac-toe/:roomId', Component: Room },
]
