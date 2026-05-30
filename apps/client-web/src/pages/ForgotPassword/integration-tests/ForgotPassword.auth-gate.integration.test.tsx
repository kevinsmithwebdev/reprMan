import { screen } from '@testing-library/react'
import React from 'react'
import { describe, expect, it, vi } from 'vitest'
import { Route, Routes } from 'react-router-dom'

import { renderWithAppShell } from '../../../test-utils'
import Home from '../../Home/Home'
import ForgotPassword from '../ForgotPassword'

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

vi.mock('@reprman/cognito-auth/useCognitoForgotPassword', () => ({
  useCognitoForgotPassword: () => ({
    step: 'request',
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
    handleRequest: vi.fn(),
    handleConfirm: vi.fn(),
    handleResend: vi.fn(),
  }),
}))

describe('ForgotPassword auth gate (integration)', () => {
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
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/" element={<Home />} />
      </Routes>,
      { initialEntries: ['/forgot-password'] }
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

    renderWithAppShell(<ForgotPassword />, {
      initialEntries: ['/forgot-password'],
    })

    expect(document.getElementById('ForgotPassword-page')).toBeTruthy()
    expect(screen.getByRole('status')).toBeTruthy()
  })
})
