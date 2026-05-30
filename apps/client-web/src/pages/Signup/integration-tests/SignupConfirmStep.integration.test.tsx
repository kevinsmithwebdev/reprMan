import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React, { useState } from 'react'
import { describe, expect, it, vi } from 'vitest'

import { renderWithAppShell } from '../../../test-utils'
import SignupConfirmStep from '../SignupConfirmStep'

describe('SignupConfirmStep (integration)', () => {
  it('submits code and supports resend and edit email', async () => {
    const onSubmit = vi.fn((e: React.FormEvent) => e.preventDefault())
    const onResend = vi.fn()
    const onEditEmail = vi.fn()

    renderWithAppShell(
      <SignupConfirmStep
        email="user@example.com"
        code="123456"
        setCode={vi.fn()}
        busy={false}
        onSubmit={onSubmit}
        onResend={onResend}
        onEditEmail={onEditEmail}
      />
    )

    await userEvent.click(
      screen.getByRole('button', { name: 'Confirm and sign in' })
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
        <SignupConfirmStep
          email="user@example.com"
          code={code}
          setCode={setCode}
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

  it('shows busy state', () => {
    renderWithAppShell(
      <SignupConfirmStep
        email="user@example.com"
        code="123456"
        setCode={vi.fn()}
        busy
        onSubmit={vi.fn()}
        onResend={vi.fn()}
        onEditEmail={vi.fn()}
      />
    )
    expect(
      screen.getByRole('button', { name: 'Confirm and sign in' })
    ).toBeDisabled()
  })
})
