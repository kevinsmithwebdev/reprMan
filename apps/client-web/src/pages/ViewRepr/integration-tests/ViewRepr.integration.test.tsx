import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
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
  const { loadedAppState, testRepr } = await import(
    '../../../test-utils/fixtures'
  )
  return {
    default: createTestStore(
      loadedAppState([
        testRepr({
          id: 'view-1',
          title: 'View me',
          comment: 'Details',
          categories: ['music'],
          datesPracticed: [Date.now() - 86_400_000, Date.now()],
        }),
        testRepr({
          id: 'view-2',
          title: 'Learning repr',
          comment: '',
          categories: [],
          learning: true,
          datesPracticed: [
            Date.now() - 7 * 86_400_000,
            Date.now() - 3 * 86_400_000,
          ],
        }),
      ])
    ),
  }
})

describe('ViewRepr (integration)', () => {
  it('renders repr details and action buttons', async () => {
    const { default: store } = await import('@reprman/state/store')
    renderWithAppShell(
      <Routes>
        <Route path="/view/:id" element={<ViewRepr />} />
      </Routes>,
      {
        store: store as TestStore,
        initialEntries: ['/view/view-1'],
      }
    )

    expect(screen.getByText('View me')).toBeTruthy()
    expect(screen.getByText('Details')).toBeTruthy()
    expect(screen.getByText('music')).toBeTruthy()
    expect(screen.getByRole('button', { name: /edit/i })).toBeTruthy()
    expect(screen.getByRole('button', { name: /delete/i })).toBeTruthy()
    expect(screen.getByRole('button', { name: /back/i })).toBeTruthy()
  })

  it('renders empty comment, no categories, and learning state', async () => {
    const { default: store } = await import('@reprman/state/store')
    renderWithAppShell(
      <Routes>
        <Route path="/view/:id" element={<ViewRepr />} />
      </Routes>,
      {
        store: store as TestStore,
        initialEntries: ['/view/view-2'],
      }
    )

    expect(screen.getByText('Learning repr')).toBeTruthy()
    expect(screen.getByText('[no comment]')).toBeTruthy()
    expect(screen.getByText('[no categories]')).toBeTruthy()
    expect(screen.getByText('Yes')).toBeTruthy()
    expect(screen.getByText(/You have practiced this repr/i)).toBeTruthy()
  })

  it('navigates back through router history', async () => {
    const { default: store } = await import('@reprman/state/store')
    renderWithAppShell(
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/view/:id" element={<ViewRepr />} />
      </Routes>,
      {
        store: store as TestStore,
        initialEntries: ['/', '/view/view-1'],
        initialIndex: 1,
      }
    )

    expect(screen.getByText('View me')).toBeTruthy()
    await userEvent.click(screen.getByRole('button', { name: /back/i }))
    expect(document.getElementById('Home-page')).toBeTruthy()
  })
})
