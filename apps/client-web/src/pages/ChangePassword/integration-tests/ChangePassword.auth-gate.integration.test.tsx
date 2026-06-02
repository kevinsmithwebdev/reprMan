import { screen } from '@testing-library/react'
import React from 'react'
import { describe, expect, it, vi } from 'vitest'
import { Route, Routes } from 'react-router-dom'

import { renderWithAppShell } from '../../../test-utils'
import Home from '../../Home/Home'
import ChangePassword from '../ChangePassword'

vi.mock('@reprman/cognito-auth/configureAmplify', async (importOriginal) => {
  const actual = await importOriginal<
    typeof import('@reprman/cognito-auth/configureAmplify')
  >()
  return { ...actual, isCognitoConfigured: () => true }
})

vi.mock('@reprman/cognito-auth/CognitoAuthContext', async (importOriginal) => {
  const actual = await importOriginal<
    typeof import('@reprman/cognito-auth/CognitoAuthContext')
  >()
  return {
    ...actual,
    useCognitoAuth: vi.fn(() => ({
      sessionChecked: true,
      signedIn: true,
      refreshSession: vi.fn(),
    })),
  }
})

vi.mock('@reprman/cognito-auth/useCognitoChangePassword', () => ({
  useCognitoChangePassword: () => ({
    oldPassword: '',
    setOldPassword: vi.fn(),
    newPassword: '',
    setNewPassword: vi.fn(),
    confirmPassword: '',
    setConfirmPassword: vi.fn(),
    busy: false,
    handleSubmit: vi.fn(),
    t: (key: string) => key,
  }),
}))

describe('ChangePassword auth gate (integration)', () => {
  it('shows spinner while session is not checked', async () => {
    const { useCognitoAuth } = await import(
      '@reprman/cognito-auth/CognitoAuthContext'
    )
    vi.mocked(useCognitoAuth).mockReturnValue({
      sessionChecked: false,
      signedIn: false,
      refreshSession: vi.fn(),
    })

    renderWithAppShell(<ChangePassword />, {
      initialEntries: ['/change-password'],
    })

    expect(document.getElementById('ChangePassword-page')).toBeTruthy()
    expect(screen.getByRole('status')).toBeTruthy()
  })

  it('redirects home when signed out', async () => {
    const { useCognitoAuth } = await import(
      '@reprman/cognito-auth/CognitoAuthContext'
    )
    vi.mocked(useCognitoAuth).mockReturnValue({
      sessionChecked: true,
      signedIn: false,
      refreshSession: vi.fn(),
    })

    renderWithAppShell(
      <Routes>
        <Route path="/change-password" element={<ChangePassword />} />
        <Route path="/" element={<Home />} />
      </Routes>,
      { initialEntries: ['/change-password'] }
    )

    expect(document.getElementById('Home-page')).toBeTruthy()
  })
})
