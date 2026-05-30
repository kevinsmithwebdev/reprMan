import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React, { useState } from 'react'
import { describe, expect, it, vi } from 'vitest'

import { renderWithAppShell } from '../../../test-utils'
import ForgotPasswordConfirmStep from '../ForgotPasswordConfirmStep'

describe('ForgotPasswordConfirmStep (integration)', () => {
  it('submits reset form and supports resend and edit email', async () => {
    const onSubmit = vi.fn((e: React.FormEvent) => e.preventDefault())
    const onResend = vi.fn()
    const onEditEmail = vi.fn()

    renderWithAppShell(
      <ForgotPasswordConfirmStep
        email="user@example.com"
        code="123456"
        setCode={vi.fn()}
        newPassword="password1"
        setNewPassword={vi.fn()}
        confirmPassword="password1"
        setConfirmPassword={vi.fn()}
        busy={false}
        onSubmit={onSubmit}
        onResend={onResend}
        onEditEmail={onEditEmail}
      />
    )

    await userEvent.click(
      screen.getByRole('button', { name: 'Set new password' })
    )
    expect(onSubmit).toHaveBeenCalled()

    await userEvent.click(screen.getByRole('button', { name: /resend/i }))
    expect(onResend).toHaveBeenCalled()

    await userEvent.click(
      screen.getByRole('button', { name: /use a different email/i })
    )
    expect(onEditEmail).toHaveBeenCalled()
  })

  it('updates code field', async () => {
    const Harness = () => {
      const [code, setCode] = useState('')
      return (
        <ForgotPasswordConfirmStep
          email="user@example.com"
          code={code}
          setCode={setCode}
          newPassword="password1"
          setNewPassword={vi.fn()}
          confirmPassword="password1"
          setConfirmPassword={vi.fn()}
          busy={false}
          onSubmit={vi.fn()}
          onResend={vi.fn()}
          onEditEmail={vi.fn()}
        />
      )
    }

    renderWithAppShell(<Harness />)
    await userEvent.type(screen.getByLabelText(/confirmation code/i), '123456')
    expect(screen.getByLabelText(/confirmation code/i)).toHaveValue('123456')
  })

  it('updates password fields', async () => {
    const setCode = vi.fn()
    const setNewPassword = vi.fn()
    const setConfirmPassword = vi.fn()

    renderWithAppShell(
      <ForgotPasswordConfirmStep
        email="user@example.com"
        code=""
        setCode={setCode}
        newPassword=""
        setNewPassword={setNewPassword}
        confirmPassword=""
        setConfirmPassword={setConfirmPassword}
        busy={false}
        onSubmit={vi.fn()}
        onResend={vi.fn()}
        onEditEmail={vi.fn()}
      />
    )

    await userEvent.type(screen.getByLabelText(/confirmation code/i), '1')
    await userEvent.type(screen.getByLabelText(/^new password$/i), 'p')
    await userEvent.type(screen.getByLabelText(/confirm password/i), 'p')
    expect(setCode).toHaveBeenCalled()
    expect(setNewPassword).toHaveBeenCalled()
    expect(setConfirmPassword).toHaveBeenCalled()
  })

  it('shows busy state', () => {
    renderWithAppShell(
      <ForgotPasswordConfirmStep
        email="user@example.com"
        code="123456"
        setCode={vi.fn()}
        newPassword="password1"
        setNewPassword={vi.fn()}
        confirmPassword="password1"
        setConfirmPassword={vi.fn()}
        busy
        onSubmit={vi.fn()}
        onResend={vi.fn()}
        onEditEmail={vi.fn()}
      />
    )
    expect(screen.getByRole('status')).toBeTruthy()
    expect(
      screen.getByRole('button', { name: 'Set new password' })
    ).toBeDisabled()
  })
})
