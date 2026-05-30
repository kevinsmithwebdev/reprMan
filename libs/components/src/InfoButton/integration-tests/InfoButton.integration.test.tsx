import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import { describe, expect, it, vi } from 'vitest'

import { ModalSelection } from '@reprman/modals/ModalContainer/ModalContainer.types'
import type { TestStore } from '../../../../../apps/client-web/src/test-utils/createTestStore'
import { renderWithAppShell } from '../../../../../apps/client-web/src/test-utils'
import store from '@reprman/state/store'
import InfoButton from '..'

vi.mock('@reprman/state/store', async () => {
  const { createTestStore } = await import(
    '../../../../../apps/client-web/src/test-utils/createTestStore'
  )
  return { default: createTestStore() }
})

describe('InfoButton (integration)', () => {
  it('opens info modal on click', async () => {
    renderWithAppShell(
      <InfoButton title="Help" body={['Line one', 'Line two']} />,
      { store: store as unknown as TestStore }
    )

    await userEvent.click(document.querySelector('svg')!)

    expect(store.getState().modal.selection).toBe(ModalSelection.INFO)
    expect(store.getState().modal.props).toMatchObject({
      title: 'Help',
      body: ['Line one', 'Line two'],
    })
  })
})
