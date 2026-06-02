import React from 'react'
import { describe, expect, it, vi } from 'vitest'
import { Route, Routes } from 'react-router-dom'

import type { TestStore } from '../../../test-utils/createTestStore'
import { renderWithAppShell } from '../../../test-utils'
import Home from '../../Home/Home'
import ViewRepr from '../ViewRepr'

vi.mock('@reprman/state/store', async () => {
  const { createTestStore } = await import(
    '../../../test-utils/createTestStore'
  )
  const { loadedAppState } = await import('../../../test-utils/fixtures')
  return { default: createTestStore(loadedAppState([])) }
})

describe('ViewRepr missing repr (integration)', () => {
  it('redirects home when repr is missing', async () => {
    const { default: store } = await import('@reprman/state/store')
    renderWithAppShell(
      <Routes>
        <Route path="/view/:id" element={<ViewRepr />} />
        <Route path="/" element={<Home />} />
      </Routes>,
      {
        store: store as TestStore,
        initialEntries: ['/view/missing-id'],
      }
    )
    expect(document.getElementById('Home-page')).toBeTruthy()
  })
})
