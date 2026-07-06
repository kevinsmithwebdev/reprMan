import { screen } from '@testing-library/react'
import React from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { navigationMocks, renderWithAppShell } from '../test-utils'
import ChangePasswordView from './ChangePasswordView'
import ForgotPasswordView from './ForgotPasswordView'
import SignInView from './SignInView'
import SignupView from './SignupView'

const authMocks = vi.hoisted(() => ({
  sessionChecked: true,
  signedIn: false,
  cognitoConfigured: true,
  signInBusy: false,
  forgotStep: 'request' as 'request' | 'confirm',
  signupStep: 'register' as 'register' | 'confirm',
}))

vi.mock('@reprman/cognito-auth/configureAmplify', async (importOriginal) => {
  const actual = await importOriginal<
    typeof import('@reprman/cognito-auth/configureAmplify')
  >()
  return {
    ...actual,
    isCognitoConfigured: () => authMocks.cognitoConfigured,
    homeAuthGateActive: () => true,
  }
})

vi.mock('@reprman/cognito-auth/CognitoAuthContext', async (importOriginal) => {
  const actual = await importOriginal<
    typeof import('@reprman/cognito-auth/CognitoAuthContext')
  >()
  return {
    ...actual,
    useCognitoAuth: () => ({
      sessionChecked: authMocks.sessionChecked,
      signedIn: authMocks.signedIn,
      refreshSession: vi.fn(),
    }),
  }
})

vi.mock('@reprman/cognito-auth', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@reprman/cognito-auth')>()
  return {
    ...actual,
    useCognitoSignIn: () => ({
      email: '',
      setEmail: vi.fn(),
      password: '',
      setPassword: vi.fn(),
      busy: authMocks.signInBusy,
      handleSignIn: vi.fn((e) => e.preventDefault()),
      t: (key: string) => key,
    }),
    useCognitoChangePassword: () => ({
      oldPassword: '',
      setOldPassword: vi.fn(),
      newPassword: '',
      setNewPassword: vi.fn(),
      confirmPassword: '',
      setConfirmPassword: vi.fn(),
      busy: false,
      handleSubmit: vi.fn((e) => e.preventDefault()),
      t: (key: string) => key,
    }),
    useCognitoForgotPassword: () => ({
      step: authMocks.forgotStep,
      email: 'a@b.com',
      setEmail: vi.fn(),
      code: '',
      setCode: vi.fn(),
      newPassword: '',
      setNewPassword: vi.fn(),
      confirmPassword: '',
      setConfirmPassword: vi.fn(),
      busy: false,
      handleRequest: vi.fn(),
      handleConfirm: vi.fn(),
      handleResend: vi.fn(),
      reset: vi.fn(),
    }),
    useCognitoSignUp: () => ({
      step: authMocks.signupStep,
      email: 'a@b.com',
      setEmail: vi.fn(),
      password: '',
      setPassword: vi.fn(),
      confirmPassword: '',
      setConfirmPassword: vi.fn(),
      code: '',
      setCode: vi.fn(),
      busy: false,
      setStep: vi.fn(),
      handleRegister: vi.fn(),
      handleConfirm: vi.fn(),
      handleResend: vi.fn(),
    }),
  }
})

describe('auth views', () => {
  beforeEach(() => {
    authMocks.sessionChecked = true
    authMocks.signedIn = false
    authMocks.cognitoConfigured = true
    authMocks.signInBusy = false
    authMocks.forgotStep = 'request'
    authMocks.signupStep = 'register'
    navigationMocks.replace.mockClear()
    navigationMocks.push.mockClear()
  })

  it('shows auth unavailable when cognito is not configured', () => {
    authMocks.cognitoConfigured = false
    renderWithAppShell(<SignInView />)
    expect(document.getElementById('SignIn-page')).toBeTruthy()
    expect(
      screen.getByText(/Sign in is not available because Cognito/i)
    ).toBeTruthy()
  })

  it('shows loading spinner while session is unchecked', () => {
    authMocks.sessionChecked = false
    renderWithAppShell(<SignInView />)
    expect(document.getElementById('SignIn-page')).toBeTruthy()
  })

  it('redirects signed-in users away from sign-in', () => {
    authMocks.signedIn = true
    const { container } = renderWithAppShell(<SignInView />)
    expect(container.firstChild).toBeNull()
    expect(navigationMocks.replace).toHaveBeenCalledWith('/')
  })

  it('renders sign-in form when auth is ready', () => {
    renderWithAppShell(<SignInView />)
    expect(screen.getByText(/Sign in/i)).toBeTruthy()
    expect(
      screen.getByRole('button', { name: /auth.signInButton/i })
    ).toBeTruthy()
  })

  it('renders change-password form for signed-in users', () => {
    authMocks.signedIn = true
    renderWithAppShell(<ChangePasswordView />)
    expect(screen.getByText(/Change password/i)).toBeTruthy()
  })

  it('redirects signed-out users away from change-password', () => {
    authMocks.signedIn = false
    const { container } = renderWithAppShell(<ChangePasswordView />)
    expect(container.firstChild).toBeNull()
    expect(navigationMocks.replace).toHaveBeenCalledWith('/')
  })

  it('renders forgot-password request and confirm steps', () => {
    renderWithAppShell(<ForgotPasswordView />)
    expect(
      screen.getByRole('button', { name: /Send reset code/i })
    ).toBeTruthy()

    authMocks.forgotStep = 'confirm'
    renderWithAppShell(<ForgotPasswordView />)
    expect(
      screen.getByRole('button', { name: /Set new password/i })
    ).toBeTruthy()
  })

  it('renders signup register and confirm steps', () => {
    renderWithAppShell(<SignupView />)
    expect(screen.getByRole('button', { name: /Create account/i })).toBeTruthy()

    authMocks.signupStep = 'confirm'
    renderWithAppShell(<SignupView />)
    expect(
      screen.getByRole('button', { name: /Confirm and sign in/i })
    ).toBeTruthy()
  })
})
