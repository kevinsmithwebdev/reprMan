import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import { describe, expect, it, vi } from 'vitest'

import ModalContainer from '@reprman/modals/ModalContainer'
import { ModalSelection } from '@reprman/modals/ModalContainer/ModalContainer.types'
import { ADD_REPR } from '@reprman/state/sagas/reprs/reprs.actions'
import type { PreloadedState } from '@reduxjs/toolkit'
import type {
  TestRootState,
  TestStore,
} from '../../../../../apps/client-web/src/test-utils/createTestStore'
import { createTestStore } from '../../../../../apps/client-web/src/test-utils/createTestStore'
import { renderWithAppShell } from '../../../../../apps/client-web/src/test-utils'
import {
  loadedAppState,
  testRepr,
  withModal,
} from '../../../../../apps/client-web/src/test-utils/fixtures'

const storeHolder = vi.hoisted(() => ({
  store: null as TestStore | null,
}))

vi.mock('@reprman/state/store', async () => {
  const { createTestStore } = await import(
    '../../../../../apps/client-web/src/test-utils/createTestStore'
  )
  return {
    get default() {
      if (!storeHolder.store) {
        storeHolder.store = createTestStore()
      }
      return storeHolder.store
    },
  }
})

const renderEditReprModal = (preloadedState: PreloadedState<TestRootState>) => {
  storeHolder.store = createTestStore(preloadedState)
  return renderWithAppShell(<ModalContainer />, { store: storeHolder.store })
}

describe('EditRepr (integration)', () => {
  it('shows quota unavailable in create mode when quota is not loaded', async () => {
    renderEditReprModal(
      withModal(ModalSelection.EDIT_REPR, {}, loadedAppState())
    )

    expect(screen.getByText(/repr limit unavailable/i)).toBeTruthy()
    expect(screen.getByRole('dialog')).toBeTruthy()
  })

  it('shows exceeded message when at creation limit', async () => {
    renderEditReprModal(
      withModal(ModalSelection.EDIT_REPR, {}, {
        ...loadedAppState([
          testRepr({ id: 'r1' }),
          testRepr({ id: 'r2', title: 'Second' }),
        ]),
        reprsQuota: { maxReprsAllowed: 2 },
      })
    )

    expect(screen.getByText(/limit/i)).toBeTruthy()
    expect(screen.getByText(/2/)).toBeTruthy()
  })

  it('renders create form when quota allows new reprs', async () => {
    renderEditReprModal(
      withModal(ModalSelection.EDIT_REPR, {}, {
        ...loadedAppState(),
        reprsQuota: { maxReprsAllowed: 10 },
      })
    )

    expect(screen.getByText(/create repr/i)).toBeTruthy()
    expect(screen.getByPlaceholderText(/enter title/i)).toBeTruthy()
    expect(screen.getByRole('button', { name: /^save$/i })).toBeDisabled()
  })

  it('renders edit form with existing repr data and disables save until dirty', async () => {
    renderEditReprModal(
      withModal(
        ModalSelection.EDIT_REPR,
        { id: 'repr-1' },
        {
          ...loadedAppState([
            testRepr({
              id: 'repr-1',
              title: 'Existing title',
              comment: 'Existing comment',
              categories: ['music'],
              learning: true,
            }),
          ]),
          reprsQuota: { maxReprsAllowed: 10 },
        }
      )
    )

    expect(screen.getByDisplayValue('Existing title')).toBeTruthy()
    expect(screen.getByDisplayValue('Existing comment')).toBeTruthy()
    expect(screen.getByText('music')).toBeTruthy()
    expect(screen.getByRole('button', { name: /^save$/i })).toBeDisabled()

    const titleInput = screen.getByPlaceholderText(/enter title/i)
    await userEvent.clear(titleInput)
    await userEvent.type(titleInput, 'Updated title')
    expect(screen.getByRole('button', { name: /^save$/i })).not.toBeDisabled()
  })

  it('shows validation errors for invalid save input', async () => {
    renderEditReprModal(
      withModal(ModalSelection.EDIT_REPR, {}, {
        ...loadedAppState(),
        reprsQuota: { maxReprsAllowed: null },
      })
    )

    await userEvent.type(screen.getByPlaceholderText(/enter title/i), 'Bad*title')
    await userEvent.click(screen.getByRole('button', { name: /^save$/i }))

    expect(screen.getByText(/asterisk/i)).toBeTruthy()
    expect(storeHolder.store!.getState().modal.selection).toBe(
      ModalSelection.EDIT_REPR
    )
  })

  it('dispatches add repr and closes modal on valid save', async () => {
    renderEditReprModal(
      withModal(ModalSelection.EDIT_REPR, {}, {
        ...loadedAppState(),
        reprsQuota: { maxReprsAllowed: null },
      })
    )

    const dispatchSpy = vi.spyOn(storeHolder.store!, 'dispatch')
    await userEvent.type(screen.getByPlaceholderText(/enter title/i), 'New repr')
    await userEvent.click(screen.getByRole('button', { name: /^save$/i }))

    expect(dispatchSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        type: ADD_REPR,
        payload: expect.objectContaining({
          title: 'New repr',
          categories: [],
          comment: '',
          learning: false,
        }),
      })
    )
    expect(storeHolder.store!.getState().modal.selection).toBeNull()
  })

  it('adds category via pill and closes without saving', async () => {
    renderEditReprModal(
      withModal(ModalSelection.EDIT_REPR, {}, {
        ...loadedAppState(),
        reprsQuota: { maxReprsAllowed: null },
        categories: {
          categories: ['music', 'dance'],
          filter: { text: '', categories: [] },
        },
      })
    )

    await userEvent.type(screen.getByPlaceholderText(/enter title/i), 'With category')
    await userEvent.click(screen.getByText('dance'))
    expect(screen.getByText('dance')).toBeTruthy()

    await userEvent.click(
      screen.getByRole('button', { name: /close without save/i })
    )
    expect(storeHolder.store!.getState().modal.selection).toBeNull()
  })

  it('adds a new category when Enter is pressed in the category input', async () => {
    renderEditReprModal(
      withModal(ModalSelection.EDIT_REPR, {}, {
        ...loadedAppState(),
        reprsQuota: { maxReprsAllowed: null },
      })
    )

    await userEvent.type(screen.getByPlaceholderText(/enter title/i), 'Enter category')
    const categoryInput = screen.getByPlaceholderText(/enter new category/i)
    await userEvent.type(categoryInput, 'blues{enter}')
    expect(screen.getByText('blues')).toBeTruthy()
  })

  it('adds a new category with the plus button and removes it', async () => {
    renderEditReprModal(
      withModal(ModalSelection.EDIT_REPR, {}, {
        ...loadedAppState(),
        reprsQuota: { maxReprsAllowed: null },
      })
    )

    await userEvent.type(screen.getByPlaceholderText(/enter title/i), 'Category test')
    await userEvent.type(
      screen.getByPlaceholderText(/enter new category/i),
      'jazz'
    )
    await userEvent.click(screen.getByRole('button', { name: '+' }))
    expect(screen.getByText('jazz')).toBeTruthy()

    await userEvent.click(screen.getByRole('button', { name: 'X' }))
    expect(screen.queryByText('jazz')).toBeNull()
  })

  it('shows category validation errors', async () => {
    renderEditReprModal(
      withModal(ModalSelection.EDIT_REPR, {}, {
        ...loadedAppState(),
        reprsQuota: { maxReprsAllowed: null },
        categories: {
          categories: ['music'],
          filter: { text: '', categories: [] },
        },
      })
    )

    await userEvent.type(screen.getByPlaceholderText(/enter title/i), 'Category error')
    await userEvent.click(screen.getByText('music'))
    await userEvent.type(
      screen.getByPlaceholderText(/enter new category/i),
      'music'
    )
    await userEvent.click(screen.getByRole('button', { name: '+' }))
    expect(screen.getByText(/That category already exists/i)).toBeTruthy()
  })

  it('saves with learning toggled on', async () => {
    renderEditReprModal(
      withModal(ModalSelection.EDIT_REPR, {}, {
        ...loadedAppState(),
        reprsQuota: { maxReprsAllowed: null },
      })
    )

    await userEvent.type(screen.getByPlaceholderText(/enter title/i), 'Learning repr')
    await userEvent.click(screen.getByRole('checkbox', { name: /learning/i }))
    await userEvent.click(screen.getByRole('button', { name: /^save$/i }))

    expect(storeHolder.store!.getState().modal.selection).toBeNull()
  })
})
