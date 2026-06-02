import { screen } from '@testing-library/react'
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
        title: 'Single choice',
        body: ['Only one option'],
        choiceDataWithActionTypes: [{ text: 'Only', actionType: 'MODAL/ONLY' }],
      })
    ),
  }
})

describe('Query edge cases (integration)', () => {
  it('renders nothing when fewer than two choices are provided', async () => {
    const { default: store } = await import('@reprman/state/store')
    renderWithAppShell(<ModalContainer />, { store: store as TestStore })

    expect(screen.queryByRole('button', { name: 'Only' })).toBeNull()
    expect(screen.queryByText('Single choice')).toBeNull()
  })
})
