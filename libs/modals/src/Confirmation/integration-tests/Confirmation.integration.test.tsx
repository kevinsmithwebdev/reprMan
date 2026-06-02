import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import { describe, expect, it, vi } from 'vitest'

import ModalContainer from '@reprman/modals/ModalContainer'
import { ConfirmationModalResponse } from '@reprman/modals/ModalContainer/ModalContainer.types'
import type { TestStore } from '../../../../../apps/client-web/src/test-utils/createTestStore'
import { renderWithAppShell } from '../../../../../apps/client-web/src/test-utils'

vi.mock('@reprman/state/store', async () => {
  const { createTestStore } = await import(
    '../../../../../apps/client-web/src/test-utils/createTestStore'
  )
  const { withModal } = await import(
    '../../../../../apps/client-web/src/test-utils/fixtures'
  )
  const { ModalSelection } = await import(
    '@reprman/modals/ModalContainer/ModalContainer.types'
  )
  return {
    default: createTestStore(
      withModal(ModalSelection.CONFIRMATION, {
        title: 'Delete repr',
        body: 'This cannot be undone.',
      })
    ),
  }
})

describe('Confirmation (integration)', () => {
  it('renders title and body', async () => {
    const { default: store } = await import('@reprman/state/store')
    renderWithAppShell(<ModalContainer />, { store: store as TestStore })

    expect(screen.getByText('Delete repr')).toBeTruthy()
    expect(screen.getByText('This cannot be undone.')).toBeTruthy()
    expect(screen.getByRole('button', { name: /yes/i })).toBeTruthy()
    expect(screen.getByRole('button', { name: /no/i })).toBeTruthy()
  })

  it('dispatches NO and closes on cancel', async () => {
    const { default: store } = await import('@reprman/state/store')
    const dispatchSpy = vi.spyOn(store, 'dispatch')
    renderWithAppShell(<ModalContainer />, { store: store as TestStore })

    await userEvent.click(screen.getByRole('button', { name: /no/i }))

    expect(dispatchSpy).toHaveBeenCalledWith({
      type: ConfirmationModalResponse.NO,
    })
    expect(store.getState().modal.selection).toBeNull()
  })
})
