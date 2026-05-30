import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import { describe, expect, it, vi } from 'vitest'

import { renderWithAppShell } from '../../../test-utils'
import Signup from '../Signup'

const { signUpFlow, signUpOptionsRef, onSignUpSuccessRef, navigateMock } =
  vi.hoisted(() => ({
    navigateMock: vi.fn(),
    signUpOptionsRef: {
      current: {} as { recordTermsAcceptance?: () => Promise<void> },
    },
    onSignUpSuccessRef: {
      current: undefined as (() => void) | undefined,
    },
    signUpFlow: {
      step: 'register' as 'register' | 'confirm',
      email: 'user@example.com',
      setEmail: vi.fn(),
      password: 'password1',
      setPassword: vi.fn(),
      confirmPassword: 'password1',
      setConfirmPassword: vi.fn(),
      code: '123456',
      setCode: vi.fn(),
      busy: false,
      setStep: vi.fn(),
      handleRegister: vi.fn((e: React.FormEvent) => e.preventDefault()),
      handleConfirm: vi.fn((e: React.FormEvent) => e.preventDefault()),
      handleResend: vi.fn(),
    },
  }))

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>()
  return {
    ...actual,
    useNavigate: () => navigateMock,
  }
})

vi.mock('@reprman/cognito-auth/configureAmplify', async (importOriginal) => {
  const actual = await importOriginal<
    typeof import('@reprman/cognito-auth/configureAmplify')
  >()
  return {
    ...actual,
    isCognitoConfigured: () => true,
    homeAuthGateActive: () => true,
  }
})

vi.mock('@reprman/cognito-auth/useCognitoSignUp', () => ({
  useCognitoSignUp: (
    onSuccess: () => void,
    options?: { recordTermsAcceptance?: () => Promise<void> }
  ) => {
    onSignUpSuccessRef.current = onSuccess
    signUpOptionsRef.current = options ?? {}
    return signUpFlow
  },
}))

vi.mock('@reprman/reprs-api', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@reprman/reprs-api')>()
  return { ...actual, isReprsApiConfigured: false }
})

describe('Signup (integration)', () => {
  it('renders register step', () => {
    signUpFlow.step = 'register'
    renderWithAppShell(<Signup />, { initialEntries: ['/signup'] })
    expect(document.getElementById('Signup-page')).toBeTruthy()
    expect(screen.getByLabelText(/email/i)).toBeTruthy()
  })

  it('renders confirm step', () => {
    signUpFlow.step = 'confirm'
    renderWithAppShell(<Signup />, { initialEntries: ['/signup'] })
    expect(screen.getByLabelText(/confirmation code/i)).toBeTruthy()
  })

  it('delegates register submit to sign-up flow', async () => {
    signUpFlow.step = 'register'
    signUpFlow.handleRegister.mockClear()
    renderWithAppShell(<Signup />, { initialEntries: ['/signup'] })

    await userEvent.click(screen.getByRole('checkbox'))
    await userEvent.click(
      screen.getByRole('button', { name: 'Create account' })
    )
    expect(signUpFlow.handleRegister).toHaveBeenCalled()
  })

  it('delegates confirm submit, resend, and edit email to sign-up flow', async () => {
    signUpFlow.step = 'confirm'
    signUpFlow.handleConfirm.mockClear()
    signUpFlow.handleResend.mockClear()
    signUpFlow.setStep.mockClear()
    signUpFlow.setCode.mockClear()
    renderWithAppShell(<Signup />, { initialEntries: ['/signup'] })

    await userEvent.click(
      screen.getByRole('button', { name: 'Confirm and sign in' })
    )
    expect(signUpFlow.handleConfirm).toHaveBeenCalled()

    await userEvent.click(screen.getByRole('button', { name: /resend/i }))
    expect(signUpFlow.handleResend).toHaveBeenCalled()

    await userEvent.click(
      screen.getByRole('button', { name: /use a different email/i })
    )
    expect(signUpFlow.setStep).toHaveBeenCalledWith('register')
    expect(signUpFlow.setCode).toHaveBeenCalledWith('')
  })

  it('does not pass recordTermsAcceptance when reprs API is not configured', () => {
    signUpFlow.step = 'register'
    renderWithAppShell(<Signup />, { initialEntries: ['/signup'] })
    expect(signUpOptionsRef.current.recordTermsAcceptance).toBeUndefined()
  })

  it('navigates home after sign-up success', () => {
    navigateMock.mockClear()
    signUpFlow.step = 'register'
    renderWithAppShell(<Signup />, { initialEntries: ['/signup'] })

    onSignUpSuccessRef.current?.()
    expect(navigateMock).toHaveBeenCalledWith('/')
  })
})
