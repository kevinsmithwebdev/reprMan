import React from 'react'
import { describe, expect, it, vi } from 'vitest'

import { runGenesisSaga } from '@reprman/state/sagas/genesis/genesis.actions'
import type { TestStore } from './test-utils/createTestStore'
import { renderWithAppShell } from './test-utils'
import App from './App'

vi.mock('@reprman/state/store', async () => {
  const { createTestStore } = await import('./test-utils/createTestStore')
  const { loadedAppState } = await import('./test-utils/fixtures')
  return { default: createTestStore(loadedAppState([])) }
})

describe('App (integration)', () => {
  it('renders shell and dispatches genesis on mount', async () => {
    const { default: store } = await import('@reprman/state/store')
    const testStore = store as TestStore
    const dispatchSpy = vi.spyOn(testStore, 'dispatch')

    renderWithAppShell(<App />, {
      store: testStore,
      initialEntries: ['/'],
    })

    expect(document.getElementById('home-page')).toBeTruthy()
    expect(document.getElementById('header-component')).toBeTruthy()
    expect(dispatchSpy).toHaveBeenCalledWith(runGenesisSaga())
    dispatchSpy.mockRestore()
  })

  it('renders about route', async () => {
    const { default: store } = await import('@reprman/state/store')
    renderWithAppShell(<App />, {
      store: store as TestStore,
      initialEntries: ['/about'],
    })
    expect(document.getElementById('About-page')).toBeTruthy()
  })

  it('redirects unknown routes to home', async () => {
    const { default: store } = await import('@reprman/state/store')
    renderWithAppShell(<App />, {
      store: store as TestStore,
      initialEntries: ['/no-such-route'],
    })
    expect(document.getElementById('Home-page')).toBeTruthy()
  })
})
