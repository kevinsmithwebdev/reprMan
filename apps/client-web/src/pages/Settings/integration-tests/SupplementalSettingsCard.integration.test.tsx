import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import { describe, expect, it, vi } from 'vitest'

import ModalContainer from '@reprman/modals/ModalContainer'
import type { TestStore } from '../../../test-utils/createTestStore'
import { renderWithAppShell } from '../../../test-utils'
import SupplementalSettingsCard from '../SupplementalSettingsCard/SupplementalSettingsCard'

vi.mock('@reprman/state/store', async () => {
  const { createTestStore } = await import(
    '../../../test-utils/createTestStore'
  )
  return { default: createTestStore() }
})

describe('SupplementalSettingsCard (integration)', () => {
  it('renders title, info button, and action buttons', async () => {
    const { default: store } = await import('@reprman/state/store')
    const onClick = vi.fn()
    renderWithAppShell(
      <>
        <SupplementalSettingsCard
          title="Reset"
          subtitle="Restore defaults"
          info={{ title: 'Help', body: ['Line one'] }}
          buttons={[{ text: 'Reset now', variant: 'warning', onClick }]}
        />
        <ModalContainer />
      </>,
      { store: store as TestStore }
    )

    expect(screen.getByText('Reset')).toBeTruthy()
    await userEvent.click(document.querySelector('svg')!)
    expect(screen.getByRole('dialog')).toBeTruthy()

    await userEvent.click(screen.getByRole('button', { name: 'Reset now' }))
    expect(onClick).toHaveBeenCalled()
  })
})
