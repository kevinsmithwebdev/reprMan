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
    homeAuthGateActive: () => true,
    isCognitoConfigured: () => false,
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

describe('SignIn unconfigured (integration)', () => {
  it('shows auth unavailable card', () => {
    renderWithAppShell(<SignIn />, { initialEntries: ['/signin'] })
    expect(document.getElementById('SignIn-page')).toBeTruthy()
    expect(screen.getByRole('link', { name: /home/i })).toBeTruthy()
  })
})
