import React from 'react'
import { describe, expect, it, vi } from 'vitest'
import { Route, Routes } from 'react-router-dom'

import { renderWithAppShell } from '../../../test-utils'
import Home from '../../Home/Home'
import ForgotPassword from '../ForgotPassword'

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

describe('ForgotPassword without auth gate (integration)', () => {
  it('redirects home when auth gate is inactive', () => {
    renderWithAppShell(
      <Routes>
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/" element={<Home />} />
      </Routes>,
      { initialEntries: ['/forgot-password'] }
    )

    expect(document.getElementById('Home-page')).toBeTruthy()
  })
})
