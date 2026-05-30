import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import { describe, expect, it, vi } from 'vitest'

import { makeToastSAC } from '@reprman/state/sagas/toast/toast.actions'
import { ToastLevel } from '@reprman/types'
import { renderWithAppShell } from '../../../test-utils'
import { loadedAppState, testRepr } from '../../../test-utils/fixtures'
import Reports from '../Reports'

describe('Reports (integration)', () => {
  it('renders repr lines and copies to clipboard', async () => {
    const { createTestStore } = await import(
      '../../../test-utils/createTestStore'
    )
    const testStore = createTestStore(
      loadedAppState([
        testRepr({ id: 'r1', title: 'Alpha', categories: ['music'] }),
      ])
    )
    const dispatchSpy = vi.spyOn(testStore, 'dispatch')
    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.assign(navigator, {
      clipboard: { writeText },
    })

    renderWithAppShell(<Reports />, {
      store: testStore,
      initialEntries: ['/reports'],
    })

    expect(document.getElementById('Reports-page')).toBeTruthy()
    expect(screen.getByText('Alpha')).toBeTruthy()

    await userEvent.click(screen.getByRole('button', { name: /copy/i }))
    expect(writeText).toHaveBeenCalled()
    expect(dispatchSpy).toHaveBeenCalledWith(
      makeToastSAC({
        body: 'List copied to clipboard.',
        level: ToastLevel.SUCCESS,
        delay: 4000,
      })
    )
    dispatchSpy.mockRestore()
  })

  it('shows empty filtered message when labels exclude all reprs', async () => {
    renderWithAppShell(<Reports />, {
      preloadedState: loadedAppState([
        testRepr({ id: '1', categories: ['music'] }),
        testRepr({ id: '2', categories: ['other'] }),
      ]),
      initialEntries: ['/reports'],
    })

    await userEvent.click(screen.getByLabelText('music'))
    await userEvent.click(screen.getByLabelText('other'))

    expect(screen.getByText('No reprs match the selected labels.')).toBeTruthy()
  })

  it('deselects a label filter when clicked again', async () => {
    renderWithAppShell(<Reports />, {
      preloadedState: loadedAppState([
        testRepr({ id: '1', title: 'Music only', categories: ['music'] }),
        testRepr({ id: '2', title: 'Other only', categories: ['other'] }),
      ]),
      initialEntries: ['/reports'],
    })

    await userEvent.click(screen.getByLabelText('music'))
    expect(screen.getByText('Music only')).toBeTruthy()
    expect(screen.queryByText('Other only')).toBeNull()
    await userEvent.click(screen.getByLabelText('music'))
    expect(screen.getByText('Music only')).toBeTruthy()
    expect(screen.getByText('Other only')).toBeTruthy()
  })

  it('shows empty library message when there are no reprs', () => {
    renderWithAppShell(<Reports />, {
      preloadedState: loadedAppState([]),
      initialEntries: ['/reports'],
    })

    expect(
      screen.getByText(/No reprs were found. Please add some/i)
    ).toBeTruthy()
  })

  it('shows loading spinner while reprs are not loaded', () => {
    renderWithAppShell(<Reports />, { initialEntries: ['/reports'] })
    expect(document.getElementById('Reports-page')).toBeTruthy()
    expect(screen.getByRole('status')).toBeTruthy()
  })

  it('includes labels in copied output when labels toggle is enabled', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.assign(navigator, {
      clipboard: { writeText },
    })

    renderWithAppShell(<Reports />, {
      preloadedState: loadedAppState([
        testRepr({ id: 'r1', title: 'Alpha', categories: ['music'] }),
      ]),
      initialEntries: ['/reports'],
    })

    await userEvent.click(screen.getByLabelText(/labels/i))
    await userEvent.click(screen.getByRole('button', { name: /copy/i }))
    expect(writeText.mock.calls[0][0]).toContain('music')
  })

  it('dispatches fail toast when clipboard copy fails', async () => {
    const { createTestStore } = await import(
      '../../../test-utils/createTestStore'
    )
    const testStore = createTestStore(
      loadedAppState([
        testRepr({ id: 'r1', title: 'Alpha', categories: ['music'] }),
      ])
    )
    const dispatchSpy = vi.spyOn(testStore, 'dispatch')
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockRejectedValue(new Error('copy failed')),
      },
    })

    renderWithAppShell(<Reports />, {
      store: testStore,
      initialEntries: ['/reports'],
    })

    await userEvent.click(screen.getByRole('button', { name: /copy/i }))
    expect(dispatchSpy).toHaveBeenCalledWith(
      makeToastSAC({
        body: 'Could not copy to clipboard.',
        level: ToastLevel.FAIL,
        delay: 6000,
      })
    )
    dispatchSpy.mockRestore()
  })
})
