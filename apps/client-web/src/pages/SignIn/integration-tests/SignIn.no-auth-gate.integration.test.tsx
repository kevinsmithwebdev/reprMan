import { screen } from '@testing-library/react'
import React from 'react'
import { describe, expect, it, vi } from 'vitest'

import { renderWithAppShell } from '../../../test-utils'
import SignIn from '../SignIn'

vi.mock('@reprman/cognito-auth/configureAmplify', async (importOriginal) => {
  const actual = await importOriginal<
    typeof import('@reprman/cognito-auth/configureAmplify')
  >()
  return {
    ...actual,
    homeAuthGateActive: () => false,
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
    email: '',
    setEmail: vi.fn(),
    password: '',
    setPassword: vi.fn(),
    busy: false,
    handleSignIn: vi.fn((e: React.FormEvent) => e.preventDefault()),
    t: (key: string) => key,
  }),
}))

describe('SignIn without auth gate (integration)', () => {
  it('renders sign-in on /signin when home auth gate is off', () => {
    renderWithAppShell(<SignIn />, { initialEntries: ['/signin'] })

    expect(document.getElementById('SignIn-page')).toBeTruthy()
    expect(screen.getByLabelText('auth.email')).toBeTruthy()
  })
})
