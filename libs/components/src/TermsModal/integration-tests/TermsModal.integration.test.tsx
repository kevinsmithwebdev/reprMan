import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import { describe, expect, it, vi } from 'vitest'

import { renderWithAppShell } from '../../../../../apps/client-web/src/test-utils'
import TermsModal from '..'

describe('TermsModal (integration)', () => {
  it('renders terms and calls onHide from footer', async () => {
    const onHide = vi.fn()
    renderWithAppShell(<TermsModal show onHide={onHide} />)
    expect(screen.getByRole('dialog')).toBeTruthy()
    await userEvent.click(screen.getByRole('button', { name: /back/i }))
    expect(onHide).toHaveBeenCalled()
  })
})
