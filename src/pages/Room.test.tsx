import { describe, it, expect } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router'
import type { ErrorScreen } from '../net/errors'
import { ErrorPage } from './Room'

const markup = (screen: ErrorScreen) =>
  renderToStaticMarkup(
    <MemoryRouter>
      <ErrorPage screen={screen} />
    </MemoryRouter>,
  )

describe('ErrorPage', () => {
  it.each([
    ['not-found', 'Room not found'],
    ['room-full', 'Room full'],
    ['connection', 'Connection problem'],
  ] as const)('%s shows "%s" and a link home', (screen, title) => {
    const html = markup(screen)
    expect(html).toContain(`<h1>${title}</h1>`)
    expect(html).toMatch(/<a[^>]*href="\/"[^>]*>Back home<\/a>/)
  })
})
