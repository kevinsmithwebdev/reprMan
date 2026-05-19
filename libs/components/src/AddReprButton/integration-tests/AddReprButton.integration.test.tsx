import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import { describe, expect, it, vi } from 'vitest'

import { ModalSelection } from '@reprman/modals/ModalContainer/ModalContainer.types'
import store from '@reprman/state/store'

import type { TestStore } from '../../../../../apps/client-web/src/test-utils/createTestStore'
import { renderWithAppShell } from '../../../../../apps/client-web/src/test-utils'
import AddReprButton from '..'

vi.mock('@reprman/state/store', async () => {
  const { createTestStore } = await import(
    '../../../../../apps/client-web/src/test-utils/createTestStore'
  )
  return { default: createTestStore() }
})

describe('AddReprButton (integration)', () => {
  it('opens edit repr modal when clicked', async () => {
    renderWithAppShell(<AddReprButton />, { store: store as unknown as TestStore })

    await userEvent.click(screen.getByRole('button', { name: /add repr/i }))

    expect(store.getState().modal.selection).toBe(ModalSelection.EDIT_REPR)
  })
})
