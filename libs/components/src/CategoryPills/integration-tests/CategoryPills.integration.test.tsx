import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import { describe, expect, it, vi } from 'vitest'

import { renderWithAppShell } from '../../../../../apps/client-web/src/test-utils'
import CategoryPills, { CategoryPillSize } from '../CategoryPills'

describe('CategoryPills (integration)', () => {
  it('renders sorted categories and handles click', async () => {
    const onClick = vi.fn()
    renderWithAppShell(
      <CategoryPills
        categories={['z', 'a', 'm']}
        onClick={onClick}
        size={CategoryPillSize.MEDIUM}
        className="pill-row"
      />
    )

    const badges = screen.getAllByText(/^[a-z]$/)
    expect(badges.map((b) => b.textContent)).toEqual(['a', 'm', 'z'])

    await userEvent.click(screen.getByText('m'))
    expect(onClick).toHaveBeenCalledWith('m')
  })

  it('uses default onClick when prop is omitted', async () => {
    renderWithAppShell(<CategoryPills categories={['a']} />)

    await userEvent.click(screen.getByText('a'))
  })
})
