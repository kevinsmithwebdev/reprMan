import { fireEvent, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import { describe, expect, it, vi } from 'vitest'

import { saveUserSettingsSAC } from '@reprman/state/sagas/settings'
import { clearAllReprsSAC } from '@reprman/state/sagas/reprs/reprs.actions'
import type { TestStore } from '../../../test-utils/createTestStore'
import { renderWithAppShell } from '../../../test-utils'
import Settings from '../Settings'

vi.mock('@reprman/state/store', async () => {
  const { createTestStore } = await import(
    '../../../test-utils/createTestStore'
  )
  const { loadedAppState } = await import('../../../test-utils/fixtures')
  return { default: createTestStore(loadedAppState([])) }
})

describe('Settings (integration)', () => {
  it('renders settings and saves changes', async () => {
    const { default: store } = await import('@reprman/state/store')
    const testStore = store as TestStore
    const dispatchSpy = vi.spyOn(testStore, 'dispatch')

    renderWithAppShell(<Settings />, {
      store: testStore,
      initialEntries: ['/settings'],
    })

    expect(document.getElementById('Settings-page')).toBeTruthy()

    const delayInput = screen.getAllByRole('spinbutton')[0]
    await userEvent.clear(delayInput)
    await userEvent.type(delayInput, '14')

    await userEvent.click(
      screen.getByRole('button', { name: 'Save Settings Changes' })
    )
    expect(dispatchSpy).toHaveBeenCalledWith(
      saveUserSettingsSAC({ practiceDelay: 14, warningRatio: 0.5 })
    )

    await userEvent.click(
      screen.getByRole('button', { name: 'Clear Settings Changes' })
    )

    await userEvent.click(
      screen.getByRole('button', { name: 'Delete All Reprs' })
    )
    expect(dispatchSpy).toHaveBeenCalledWith(clearAllReprsSAC())

    dispatchSpy.mockRestore()
  })

  it('ignores out-of-range practice delay values', async () => {
    renderWithAppShell(<Settings />, { initialEntries: ['/settings'] })

    const delayInput = screen.getAllByRole('spinbutton')[0]
    fireEvent.change(delayInput, { target: { value: '999' } })
    expect(delayInput).toHaveValue(30)
  })

  it('updates warning ratio and saves', async () => {
    const { default: store } = await import('@reprman/state/store')
    const testStore = store as TestStore
    const dispatchSpy = vi.spyOn(testStore, 'dispatch')

    renderWithAppShell(<Settings />, {
      store: testStore,
      initialEntries: ['/settings'],
    })

    const ratioInput = screen.getAllByRole('spinbutton')[1]
    await userEvent.clear(ratioInput)
    await userEvent.type(ratioInput, '0.8')

    await userEvent.click(
      screen.getByRole('button', { name: 'Save Settings Changes' })
    )
    expect(dispatchSpy).toHaveBeenCalledWith(
      saveUserSettingsSAC({ practiceDelay: 30, warningRatio: 0.8 })
    )
    dispatchSpy.mockRestore()
  })

  it('ignores out-of-range warning ratio values', async () => {
    renderWithAppShell(<Settings />, { initialEntries: ['/settings'] })

    const ratioInput = screen.getAllByRole('spinbutton')[1]
    fireEvent.change(ratioInput, { target: { value: '5' } })
    expect(ratioInput).toHaveValue(0.5)
  })
})
