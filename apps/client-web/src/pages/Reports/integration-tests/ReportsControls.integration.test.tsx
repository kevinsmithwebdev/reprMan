import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import { describe, expect, it, vi } from 'vitest'

import { renderWithAppShell } from '../../../test-utils'
import ReportsControls from '../ReportsControls'

describe('ReportsControls (integration)', () => {
  it('renders category filters and toggles', async () => {
    const onToggleLabel = vi.fn()
    renderWithAppShell(
      <ReportsControls
        allCategories={['alpha', 'beta']}
        selectedLabels={[]}
        onToggleLabel={onToggleLabel}
        includeComments={false}
        onIncludeCommentsChange={vi.fn()}
        includeLabels={false}
        onIncludeLabelsChange={vi.fn()}
        onCopy={vi.fn()}
      />
    )

    await userEvent.click(screen.getByLabelText('alpha'))
    expect(onToggleLabel).toHaveBeenCalledWith('alpha')
    expect(document.getElementById('reports-controls-component')).toBeTruthy()
  })

  it('renders placeholder when no categories exist', () => {
    renderWithAppShell(
      <ReportsControls
        allCategories={[]}
        selectedLabels={[]}
        onToggleLabel={vi.fn()}
        includeComments={false}
        onIncludeCommentsChange={vi.fn()}
        includeLabels={false}
        onIncludeLabelsChange={vi.fn()}
        onCopy={vi.fn()}
      />
    )
    expect(screen.getByText('—')).toBeTruthy()
  })

  it('handles content and copy controls', async () => {
    const onIncludeCommentsChange = vi.fn()
    const onIncludeLabelsChange = vi.fn()
    const onToggleLabel = vi.fn()
    const onCopy = vi.fn()
    renderWithAppShell(
      <ReportsControls
        allCategories={['alpha', 'beta']}
        selectedLabels={['alpha']}
        onToggleLabel={onToggleLabel}
        includeComments={false}
        onIncludeCommentsChange={onIncludeCommentsChange}
        includeLabels={false}
        onIncludeLabelsChange={onIncludeLabelsChange}
        onCopy={onCopy}
      />
    )

    await userEvent.click(screen.getByLabelText(/comments/i))
    expect(onIncludeCommentsChange).toHaveBeenCalledWith(true)

    await userEvent.click(screen.getByLabelText(/labels/i))
    expect(onIncludeLabelsChange).toHaveBeenCalledWith(true)

    await userEvent.click(screen.getByLabelText('alpha'))
    expect(onToggleLabel).toHaveBeenCalledWith('alpha')

    await userEvent.click(screen.getByRole('button', { name: /copy/i }))
    expect(onCopy).toHaveBeenCalled()
  })
})
