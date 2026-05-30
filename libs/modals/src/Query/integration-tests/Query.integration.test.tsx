import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import { describe, expect, it, vi } from 'vitest'

import ModalContainer from '@reprman/modals/ModalContainer'
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
      withModal(ModalSelection.QUERY, {
        title: 'Export data',
        body: ['Choose format:', 'CSV or JSON'],
        choiceDataWithActionTypes: [
          { text: 'CSV', actionType: 'MODAL/EXPORT_CSV', variant: 'primary' },
          {
            text: 'JSON',
            actionType: 'MODAL/EXPORT_JSON',
            variant: 'secondary',
          },
        ],
      })
    ),
  }
})

describe('Query (integration)', () => {
  it('renders body paragraphs and choice buttons', async () => {
    const { default: store } = await import('@reprman/state/store')
    renderWithAppShell(<ModalContainer />, { store: store as TestStore })

    expect(screen.getByText('Export data')).toBeTruthy()
    expect(screen.getByText('Choose format:')).toBeTruthy()
    expect(screen.getByText('CSV or JSON')).toBeTruthy()
    expect(screen.getByRole('button', { name: 'CSV' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'JSON' })).toBeTruthy()
  })

  it('dispatches action type and closes when a choice is clicked', async () => {
    const { default: store } = await import('@reprman/state/store')
    const dispatchSpy = vi.spyOn(store, 'dispatch')
    renderWithAppShell(<ModalContainer />, { store: store as TestStore })

    await userEvent.click(screen.getByRole('button', { name: 'CSV' }))

    expect(dispatchSpy).toHaveBeenCalledWith({
      type: 'MODAL/EXPORT_CSV',
      payload: 'MODAL/EXPORT_CSV',
    })
    expect(store.getState().modal.selection).toBeNull()
  })
})
