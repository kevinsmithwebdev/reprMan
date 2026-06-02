import { screen } from '@testing-library/react'
import React from 'react'
import { describe, expect, it, vi } from 'vitest'

import { renderWithAppShell } from '../../../test-utils'
import { loadedAppState } from '../../../test-utils/fixtures'
import Reports from '../Reports'

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

describe('Reports auth gate (integration)', () => {
  it('shows sign-in card when signed out', () => {
    renderWithAppShell(<Reports />, {
      preloadedState: loadedAppState([]),
      initialEntries: ['/reports'],
    })

    expect(document.getElementById('Reports-page')).toBeTruthy()
    expect(screen.getByRole('button', { name: /^sign in$/i })).toBeTruthy()
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

    renderWithAppShell(<Reports />, { initialEntries: ['/reports'] })
    expect(document.getElementById('Reports-page')).toBeTruthy()
    expect(screen.getByRole('status')).toBeTruthy()
  })
})
