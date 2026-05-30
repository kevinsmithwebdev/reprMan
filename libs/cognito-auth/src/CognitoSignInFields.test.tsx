import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import { describe, expect, it, vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'

import CognitoSignInFields from './CognitoSignInFields'

describe('CognitoSignInFields', () => {
  it('renders email and password fields and wires change handlers', async () => {
    const setEmail = vi.fn()
    const setPassword = vi.fn()

    render(
      <MemoryRouter>
        <form>
          <CognitoSignInFields
            idPrefix="sign-in"
            email="user@example.com"
            setEmail={setEmail}
            password="secret"
            setPassword={setPassword}
            busy={false}
            emailLabel="auth.email"
            passwordLabel="auth.password"
            createAccountLabel="auth.signUpButton"
          />
        </form>
      </MemoryRouter>
    )

    expect(screen.getByLabelText('auth.email')).toHaveValue('user@example.com')
    expect(screen.getByLabelText('auth.password')).toHaveValue('secret')
    expect(
      screen.getByRole('link', { name: 'auth.signUpButton' })
    ).toHaveAttribute('href', '/signup')

    await userEvent.type(screen.getByLabelText('auth.email'), 'a')
    await userEvent.type(screen.getByLabelText('auth.password'), 'b')
    expect(setEmail).toHaveBeenCalled()
    expect(setPassword).toHaveBeenCalled()
  })

  it('disables inputs while busy and can hide create-account link', () => {
    render(
      <MemoryRouter>
        <CognitoSignInFields
          idPrefix="sign-in"
          email=""
          setEmail={vi.fn()}
          password=""
          setPassword={vi.fn()}
          busy
          emailLabel="auth.email"
          passwordLabel="auth.password"
          createAccountLabel="auth.signUpButton"
          showCreateAccountLink={false}
        />
      </MemoryRouter>
    )

    expect(screen.getByLabelText('auth.email')).toBeDisabled()
    expect(screen.getByLabelText('auth.password')).toBeDisabled()
    expect(screen.queryByRole('link', { name: 'auth.signUpButton' })).toBeNull()
  })

  it('calls onCreateAccountNavigate when create-account link is clicked', async () => {
    const onCreateAccountNavigate = vi.fn()

    render(
      <MemoryRouter>
        <CognitoSignInFields
          idPrefix="sign-in"
          email=""
          setEmail={vi.fn()}
          password=""
          setPassword={vi.fn()}
          busy={false}
          emailLabel="auth.email"
          passwordLabel="auth.password"
          createAccountLabel="auth.signUpButton"
          onCreateAccountNavigate={onCreateAccountNavigate}
        />
      </MemoryRouter>
    )

    await userEvent.click(
      screen.getByRole('link', { name: 'auth.signUpButton' })
    )
    expect(onCreateAccountNavigate).toHaveBeenCalled()
  })
})
