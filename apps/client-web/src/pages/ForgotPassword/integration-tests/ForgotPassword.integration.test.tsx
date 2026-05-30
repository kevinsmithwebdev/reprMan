import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import { describe, expect, it, vi } from 'vitest'

import { renderWithAppShell } from '../../../test-utils'
import ForgotPassword from '../ForgotPassword'

const { forgotFlow, onForgotPasswordSuccessRef, navigateMock } = vi.hoisted(
  () => ({
    navigateMock: vi.fn(),
    onForgotPasswordSuccessRef: {
      current: undefined as (() => void) | undefined,
    },
    forgotFlow: {
      step: 'request' as 'request' | 'confirm',
      email: '',
      setEmail: vi.fn(),
      code: '',
      setCode: vi.fn(),
      newPassword: '',
      setNewPassword: vi.fn(),
      confirmPassword: '',
      setConfirmPassword: vi.fn(),
      busy: false,
      reset: vi.fn(),
      handleRequest: vi.fn((e: React.FormEvent) => e.preventDefault()),
      handleConfirm: vi.fn((e: React.FormEvent) => e.preventDefault()),
      handleResend: vi.fn(),
    },
  })
)

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
    useCognitoAuth: () => ({
      sessionChecked: true,
      signedIn: false,
      refreshSession: vi.fn(),
    }),
  }
})

vi.mock('@reprman/cognito-auth/useCognitoForgotPassword', () => ({
  useCognitoForgotPassword: (onSuccess: () => void) => {
    onForgotPasswordSuccessRef.current = onSuccess
    return forgotFlow
  },
}))

describe('ForgotPassword (integration)', () => {
  it('renders request step', () => {
    forgotFlow.step = 'request'
    renderWithAppShell(<ForgotPassword />, {
      initialEntries: ['/forgot-password'],
    })
    expect(document.getElementById('ForgotPassword-page')).toBeTruthy()
    expect(screen.getByLabelText(/email/i)).toBeTruthy()
  })

  it('renders confirm step', () => {
    forgotFlow.step = 'confirm'
    renderWithAppShell(<ForgotPassword />, {
      initialEntries: ['/forgot-password'],
    })
    expect(screen.getByLabelText(/confirmation code/i)).toBeTruthy()
  })

  it('delegates request submit to forgot password flow', async () => {
    forgotFlow.step = 'request'
    forgotFlow.email = 'user@example.com'
    forgotFlow.handleRequest.mockClear()
    renderWithAppShell(<ForgotPassword />, {
      initialEntries: ['/forgot-password'],
    })

    await userEvent.click(
      screen.getByRole('button', { name: 'Send reset code' })
    )
    expect(forgotFlow.handleRequest).toHaveBeenCalled()
  })

  it('delegates confirm submit and resend to forgot password flow', async () => {
    forgotFlow.step = 'confirm'
    forgotFlow.email = 'user@example.com'
    forgotFlow.code = '123456'
    forgotFlow.newPassword = 'password1'
    forgotFlow.confirmPassword = 'password1'
    forgotFlow.handleConfirm.mockClear()
    forgotFlow.handleResend.mockClear()
    forgotFlow.reset.mockClear()
    renderWithAppShell(<ForgotPassword />, {
      initialEntries: ['/forgot-password'],
    })

    await userEvent.click(
      screen.getByRole('button', { name: 'Set new password' })
    )
    expect(forgotFlow.handleConfirm).toHaveBeenCalled()

    await userEvent.click(screen.getByRole('button', { name: /resend/i }))
    expect(forgotFlow.handleResend).toHaveBeenCalled()

    await userEvent.click(
      screen.getByRole('button', { name: /use a different email/i })
    )
    expect(forgotFlow.reset).toHaveBeenCalled()
  })

  it('navigates to sign-in after password reset success', () => {
    navigateMock.mockClear()
    forgotFlow.step = 'request'
    renderWithAppShell(<ForgotPassword />, {
      initialEntries: ['/forgot-password'],
    })

    onForgotPasswordSuccessRef.current?.()
    expect(navigateMock).toHaveBeenCalledWith('/signin', { replace: true })
  })
})
