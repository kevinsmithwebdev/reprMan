import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React, { useState } from 'react'
import { describe, expect, it, vi } from 'vitest'

import { renderWithAppShell } from '../../../test-utils'
import ForgotPasswordRequestStep from '../ForgotPasswordRequestStep'

describe('ForgotPasswordRequestStep (integration)', () => {
  it('submits email request form', async () => {
    const onSubmit = vi.fn((e: React.FormEvent) => e.preventDefault())
    renderWithAppShell(
      <ForgotPasswordRequestStep
        email="user@example.com"
        setEmail={vi.fn()}
        busy={false}
        onSubmit={onSubmit}
      />
    )

    await userEvent.click(
      screen.getByRole('button', { name: 'Send reset code' })
    )
    expect(onSubmit).toHaveBeenCalled()
  })

  it('updates email, shows busy state, and renders navigation links', async () => {
    const onSubmit = vi.fn((e: React.FormEvent) => e.preventDefault())
    const Harness = () => {
      const [email, setEmail] = useState('')
      return (
        <ForgotPasswordRequestStep
          email={email}
          setEmail={setEmail}
          busy={false}
          onSubmit={onSubmit}
        />
      )
    }

    renderWithAppShell(<Harness />)
    await userEvent.type(screen.getByLabelText(/email/i), 'user@example.com')
    expect(screen.getByLabelText(/email/i)).toHaveValue('user@example.com')
    expect(screen.getByRole('link', { name: /^sign in$/i })).toBeTruthy()
    expect(screen.getByRole('link', { name: /back to home/i })).toBeTruthy()
  })

  it('shows spinner when busy', () => {
    renderWithAppShell(
      <ForgotPasswordRequestStep
        email="user@example.com"
        setEmail={vi.fn()}
        busy
        onSubmit={vi.fn()}
      />
    )
    expect(screen.getByRole('status')).toBeTruthy()
    expect(
      screen.getByRole('button', { name: 'Send reset code' })
    ).toBeDisabled()
  })
})
