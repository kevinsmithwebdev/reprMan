import { screen } from '@testing-library/react'
import React from 'react'
import { describe, expect, it, vi } from 'vitest'

import { renderWithAppShell } from '../../../test-utils'
import { loadedAppState } from '../../../test-utils/fixtures'
import Home from '../Home'

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

describe('Home auth gate (integration)', () => {
  it('shows sign-in card when signed out', () => {
    renderWithAppShell(<Home />, {
      preloadedState: loadedAppState([]),
    })

    expect(document.getElementById('Home-page')).toBeTruthy()
    expect(screen.getByRole('button', { name: /^sign in$/i })).toBeTruthy()
  })
})

describe('Home auth gate loading (integration)', () => {
  it('shows spinner while session is not checked', async () => {
    const { useCognitoAuth } = await import(
      '@reprman/cognito-auth/CognitoAuthContext'
    )
    vi.mocked(useCognitoAuth).mockReturnValue({
      sessionChecked: false,
      signedIn: false,
      refreshSession: vi.fn(),
    })

    renderWithAppShell(<Home />)

    expect(document.getElementById('Home-page')).toBeTruthy()
    expect(screen.getByRole('status')).toBeTruthy()
  })
})
