import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import { describe, expect, it, vi } from 'vitest'

import ModalContainer from '@reprman/modals/ModalContainer'
import {
  ConfirmationModalResponse,
  ModalSelection,
} from '@reprman/modals/ModalContainer/ModalContainer.types'
import type { TestStore } from '../../../../../apps/client-web/src/test-utils/createTestStore'
import { renderWithAppShell } from '../../../../../apps/client-web/src/test-utils'
import {
  loadedAppState,
  testRepr,
  withModal,
} from '../../../../../apps/client-web/src/test-utils/fixtures'

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
        title: 'Confirm action',
        body: 'Are you sure?',
      })
    ),
  }
})

describe('ModalContainer (integration)', () => {
  it('renders confirmation modal from preloaded selection', async () => {
    const { default: store } = await import('@reprman/state/store')
    renderWithAppShell(<ModalContainer />, { store: store as TestStore })

    expect(screen.getByRole('dialog')).toBeTruthy()
    expect(screen.getByText('Confirm action')).toBeTruthy()
    expect(screen.getByText('Are you sure?')).toBeTruthy()
  })

  it('closes modal and dispatches confirmation response on yes', async () => {
    const { default: store } = await import('@reprman/state/store')
    const dispatchSpy = vi.spyOn(store, 'dispatch')
    renderWithAppShell(<ModalContainer />, { store: store as TestStore })

    await userEvent.click(screen.getByRole('button', { name: /yes/i }))

    expect(dispatchSpy).toHaveBeenCalledWith({
      type: ConfirmationModalResponse.YES,
    })
    expect(store.getState().modal.selection).toBeNull()
  })

  it('renders edit repr modal when selection is EDIT_REPR', async () => {
    const { createTestStore } = await import(
      '../../../../../apps/client-web/src/test-utils/createTestStore'
    )
    const store = createTestStore(
      withModal(ModalSelection.EDIT_REPR, {}, {
        ...loadedAppState(),
        reprsQuota: { maxReprsAllowed: 10 },
      })
    )
    renderWithAppShell(<ModalContainer />, { store })

    expect(screen.getByRole('dialog')).toBeTruthy()
    expect(screen.getByText(/create repr/i)).toBeTruthy()
  })

  it('renders info modal when selection is INFO', async () => {
    const { createTestStore } = await import(
      '../../../../../apps/client-web/src/test-utils/createTestStore'
    )
    const store = createTestStore(
      withModal(ModalSelection.INFO, {
        title: 'Help title',
        body: ['Line one', 'Section:'],
      })
    )
    renderWithAppShell(<ModalContainer />, { store })

    expect(screen.getByText('Help title')).toBeTruthy()
    expect(screen.getByText('Line one')).toBeTruthy()
    expect(screen.getByText('Section:')).toBeTruthy()
  })

  it('renders query modal when selection is QUERY', async () => {
    const { createTestStore } = await import(
      '../../../../../apps/client-web/src/test-utils/createTestStore'
    )
    const store = createTestStore(
      withModal(ModalSelection.QUERY, {
        title: 'Choose one',
        body: ['Pick an option'],
        choiceDataWithActionTypes: [
          { text: 'Option A', actionType: 'MODAL/OPTION_A' },
          { text: 'Option B', actionType: 'MODAL/OPTION_B', variant: 'warning' },
        ],
      })
    )
    renderWithAppShell(<ModalContainer />, { store })

    expect(screen.getByText('Choose one')).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Option A' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Option B' })).toBeTruthy()
  })

  it('clears modal when header close is clicked', async () => {
    const { default: store } = await import('@reprman/state/store')
    const { setModal } = await import('@reprman/state/modal')
    store.dispatch(
      setModal({
        selection: ModalSelection.CONFIRMATION,
        props: { title: 'Confirm action', body: 'Are you sure?' },
      })
    )
    renderWithAppShell(<ModalContainer />, { store: store as TestStore })

    await userEvent.click(screen.getByLabelText(/close/i))

    expect(store.getState().modal.selection).toBeNull()
  })
})
