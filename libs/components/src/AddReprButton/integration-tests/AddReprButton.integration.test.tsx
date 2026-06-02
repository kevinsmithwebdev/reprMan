import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { ModalSelection } from '@reprman/modals/ModalContainer/ModalContainer.types'
import { clearModal } from '@reprman/state/modal'
import { resetReprs } from '@reprman/state/reprs'
import { resetMaxReprsQuota, setMaxReprsQuota } from '@reprman/state/reprsQuota'
import store from '@reprman/state/store'

import { renderWithAppShell } from '../../../../../apps/client-web/src/test-utils'
import AddReprButton from '..'

vi.mock('@reprman/state/store', async () => {
  const { createTestStore } = await import(
    '../../../../../apps/client-web/src/test-utils/createTestStore'
  )
  return { default: createTestStore() }
})

describe('AddReprButton (integration)', () => {
  beforeEach(() => {
    store.dispatch(clearModal())
    store.dispatch(resetReprs())
    store.dispatch(resetMaxReprsQuota())
  })

  it('opens edit repr modal when clicked', async () => {
    renderWithAppShell(<AddReprButton />, { store })

    userEvent.click(screen.getByRole('button', { name: /add repr/i }))

    expect(store.getState().modal.selection).toBe(ModalSelection.EDIT_REPR)
  })

  it('disables the button and shows a tooltip when at repr limit', () => {
    store.dispatch(setMaxReprsQuota(0))

    renderWithAppShell(<AddReprButton />, { store })

    const button = screen.getByRole('button', { name: /add repr/i })
    expect(button).toBeDisabled()
    expect(button).toHaveAttribute('title')
    expect(button.getAttribute('title')).toBeTruthy()
  })
})
