import { describe, it, expect } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router'
import Home from './Home'

const markup = () =>
  renderToStaticMarkup(
    <MemoryRouter>
      <Home />
    </MemoryRouter>,
  )

describe('Home (game picker)', () => {
  it('links the tic-tac-toe card to /tic-tac-toe', () => {
    expect(markup()).toMatch(/<a[^>]*href="\/tic-tac-toe"[^>]*>.*Tic-tac-toe.*?<\/a>/s)
  })

  it('shows checkers as a disabled card saying "coming soon"', () => {
    expect(markup()).toMatch(/<button[^>]*disabled=""[^>]*>.*Checkers.*coming soon.*?<\/button>/is)
  })
})
