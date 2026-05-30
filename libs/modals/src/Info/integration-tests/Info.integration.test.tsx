import { screen } from '@testing-library/react'
import React from 'react'
import { describe, expect, it, vi } from 'vitest'

import ModalContainer from '@reprman/modals/ModalContainer'
import type { TestStore } from '../../../../../apps/client-web/src/test-utils/createTestStore'
import { renderWithAppShell } from '../../../../../apps/client-web/src/test-utils'
import { withModal } from '../../../../../apps/client-web/src/test-utils/fixtures'

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
      withModal(ModalSelection.INFO, {
        title: 'About quotas',
        body: ['Overview:', 'Your plan limits repr count.'],
      })
    ),
  }
})

describe('Info (integration)', () => {
  it('renders title and body paragraphs without footer actions', async () => {
    const { default: store } = await import('@reprman/state/store')
    renderWithAppShell(<ModalContainer />, { store: store as TestStore })

    expect(screen.getByRole('dialog')).toBeTruthy()
    expect(screen.getByText('About quotas')).toBeTruthy()
    expect(screen.getByText('Overview:')).toBeTruthy()
    expect(screen.getByText('Your plan limits repr count.')).toBeTruthy()
    expect(screen.queryByRole('button', { name: /save/i })).toBeNull()
  })
})
