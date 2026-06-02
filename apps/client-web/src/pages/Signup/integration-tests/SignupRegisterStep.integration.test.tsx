import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React, { useState } from 'react'
import { describe, expect, it, vi } from 'vitest'

import { renderWithAppShell } from '../../../test-utils'
import SignupRegisterStep from '../SignupRegisterStep'

describe('SignupRegisterStep (integration)', () => {
  it('submits registration form when terms accepted', async () => {
    const onSubmit = vi.fn((e: React.FormEvent) => e.preventDefault())
    const Harness = () => {
      const [email, setEmail] = useState('user@example.com')
      const [password, setPassword] = useState('password1')
      const [confirmPassword, setConfirmPassword] = useState('password1')
      const [accepted, setAccepted] = useState(false)
      return (
        <SignupRegisterStep
          email={email}
          setEmail={setEmail}
          password={password}
          setPassword={setPassword}
          confirmPassword={confirmPassword}
          setConfirmPassword={setConfirmPassword}
          acceptedTerms={accepted}
          setAcceptedTerms={setAccepted}
          busy={false}
          onSubmit={onSubmit}
        />
      )
    }

    renderWithAppShell(<Harness />)
    expect(
      screen.getByRole('button', { name: 'Create account' })
    ).toBeDisabled()
    await userEvent.click(screen.getByRole('checkbox'))
    await userEvent.click(
      screen.getByRole('button', { name: 'Create account' })
    )
    expect(onSubmit).toHaveBeenCalled()
  })

  it('updates email field', async () => {
    const Harness = () => {
      const [email, setEmail] = useState('')
      return (
        <SignupRegisterStep
          email={email}
          setEmail={setEmail}
          password="password1"
          setPassword={vi.fn()}
          confirmPassword="password1"
          setConfirmPassword={vi.fn()}
          acceptedTerms
          setAcceptedTerms={vi.fn()}
          busy={false}
          onSubmit={vi.fn()}
        />
      )
    }

    renderWithAppShell(<Harness />)
    await userEvent.type(screen.getByLabelText(/email/i), 'user@example.com')
    expect(screen.getByLabelText(/email/i)).toHaveValue('user@example.com')
  })

  it('updates password fields', async () => {
    const setPassword = vi.fn()
    const setConfirmPassword = vi.fn()

    renderWithAppShell(
      <SignupRegisterStep
        email="user@example.com"
        setEmail={vi.fn()}
        password=""
        setPassword={setPassword}
        confirmPassword=""
        setConfirmPassword={setConfirmPassword}
        acceptedTerms
        setAcceptedTerms={vi.fn()}
        busy={false}
        onSubmit={vi.fn()}
      />
    )

    await userEvent.type(screen.getByLabelText(/^password$/i), 'p')
    await userEvent.type(screen.getByLabelText(/confirm password/i), 'p')
    expect(setPassword).toHaveBeenCalled()
    expect(setConfirmPassword).toHaveBeenCalled()
  })

  it('shows busy state', () => {
    renderWithAppShell(
      <SignupRegisterStep
        email="user@example.com"
        setEmail={vi.fn()}
        password="password1"
        setPassword={vi.fn()}
        confirmPassword="password1"
        setConfirmPassword={vi.fn()}
        acceptedTerms
        setAcceptedTerms={vi.fn()}
        busy
        onSubmit={vi.fn()}
      />
    )
    expect(
      screen.getByRole('button', { name: 'Create account' })
    ).toBeDisabled()
  })
})
