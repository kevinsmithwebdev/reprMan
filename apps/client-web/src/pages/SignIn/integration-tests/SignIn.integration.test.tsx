import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import { describe, expect, it, vi } from 'vitest'
import { Route, Routes } from 'react-router-dom'

import { renderWithAppShell } from '../../../test-utils'
import Home from '../../Home/Home'
import SignIn from '../SignIn'

const signInState = {
  email: 'user@example.com',
  setEmail: vi.fn(),
  password: 'secret',
  setPassword: vi.fn(),
  busy: false,
  handleSignIn: vi.fn((e: React.FormEvent) => e.preventDefault()),
}

vi.mock('@reprman/cognito-auth/configureAmplify', async (importOriginal) => {
  const actual = await importOriginal<
    typeof import('@reprman/cognito-auth/configureAmplify')
  >()
  return {
    ...actual,
    homeAuthGateActive: () => true,
    isCognitoConfigured: () => true,
  }
})

vi.mock('@reprman/cognito-auth/CognitoAuthContext', async (importOriginal) => {
  const actual = await importOriginal<
    typeof import('@reprman/cognito-auth/CognitoAuthContext')
  >()
  return {
    ...actual,
    useCognitoAuth: vi.fn(() => ({
      sessionChecked: true,
      signedIn: false,
      refreshSession: vi.fn(),
    })),
  }
})

vi.mock('@reprman/cognito-auth/useCognitoSignIn', () => ({
  useCognitoSignIn: () => ({
    ...signInState,
    t: (key: string) => key,
  }),
}))

describe('SignIn (integration)', () => {
  it('renders sign-in form and submits', async () => {
    signInState.busy = false
    signInState.handleSignIn.mockClear()
    renderWithAppShell(<SignIn />, { initialEntries: ['/signin'] })
    expect(document.getElementById('SignIn-page')).toBeTruthy()
    await userEvent.click(
      screen.getByRole('button', { name: 'auth.signInButton' })
    )
    expect(signInState.handleSignIn).toHaveBeenCalled()
  })

  it('calls field setters on change', async () => {
    signInState.setEmail.mockClear()
    signInState.setPassword.mockClear()
    signInState.busy = false
    renderWithAppShell(<SignIn />, { initialEntries: ['/signin'] })

    await userEvent.type(screen.getByLabelText('auth.email'), 'a')
    await userEvent.type(screen.getByLabelText('auth.password'), 'b')
    expect(signInState.setEmail).toHaveBeenCalled()
    expect(signInState.setPassword).toHaveBeenCalled()
  })

  it('shows busy spinner on submit button', () => {
    signInState.busy = true
    renderWithAppShell(<SignIn />, { initialEntries: ['/signin'] })
    expect(screen.getByRole('status')).toBeTruthy()
    signInState.busy = false
  })

  it('navigates to signup from create account control', async () => {
    signInState.busy = false
    renderWithAppShell(
      <Routes>
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<div id="Signup-page" />} />
      </Routes>,
      { initialEntries: ['/signin'] }
    )

    await userEvent.click(
      screen.getByRole('link', { name: 'auth.signUpButton' })
    )
    expect(document.getElementById('Signup-page')).toBeTruthy()
  })
})

describe('SignIn auth gate (integration)', () => {
  it('redirects home when already signed in', async () => {
    const { useCognitoAuth } = await import(
      '@reprman/cognito-auth/CognitoAuthContext'
    )
    vi.mocked(useCognitoAuth).mockReturnValue({
      sessionChecked: true,
      signedIn: true,
      refreshSession: vi.fn(),
    })

    renderWithAppShell(
      <Routes>
        <Route path="/signin" element={<SignIn />} />
        <Route path="/" element={<Home />} />
      </Routes>,
      { initialEntries: ['/signin'] }
    )

    expect(document.getElementById('Home-page')).toBeTruthy()
  })

  it('shows spinner while session is not checked', async () => {
    const { useCognitoAuth } = await import(
      '@reprman/cognito-auth/CognitoAuthContext'
    )
    vi.mocked(useCognitoAuth).mockReturnValue({
      sessionChecked: false,
      signedIn: false,
      refreshSession: vi.fn(),
    })

    renderWithAppShell(<SignIn />, { initialEntries: ['/signin'] })
    expect(document.getElementById('SignIn-page')).toBeTruthy()
    expect(screen.getByRole('status')).toBeTruthy()
  })
})
