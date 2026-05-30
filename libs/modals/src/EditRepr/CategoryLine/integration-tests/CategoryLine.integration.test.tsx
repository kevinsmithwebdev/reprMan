import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import { describe, expect, it, vi } from 'vitest'

import { renderWithAppShell } from '../../../../../../apps/client-web/src/test-utils'
import CategoryLine from '../CategoryLine'

describe('CategoryLine (integration)', () => {
  it('renders category label and remove button', async () => {
    const removeCategory = vi.fn()
    renderWithAppShell(
      <CategoryLine category="music" removeCategory={removeCategory} />
    )

    expect(screen.getByText('music')).toBeTruthy()
    await userEvent.click(screen.getByRole('button', { name: 'X' }))
    expect(removeCategory).toHaveBeenCalledWith('music')
  })
})
