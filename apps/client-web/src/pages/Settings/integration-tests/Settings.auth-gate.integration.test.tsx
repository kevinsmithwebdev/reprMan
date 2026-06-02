import { screen } from '@testing-library/react'
import React from 'react'
import { describe, expect, it, vi } from 'vitest'
import { Route, Routes } from 'react-router-dom'

import { renderWithAppShell } from '../../../test-utils'
import { loadedAppState } from '../../../test-utils/fixtures'
import Home from '../../Home/Home'
import Settings from '../Settings'

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
      signedIn: true,
      refreshSession: vi.fn(),
    })),
  }
})

vi.mock('@reprman/state/store', async () => {
  const { createTestStore } = await import(
    '../../../test-utils/createTestStore'
  )
  const { loadedAppState: loadState } = await import(
    '../../../test-utils/fixtures'
  )
  return { default: createTestStore(loadState([])) }
})

describe('Settings auth gate (integration)', () => {
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
        <Route path="/settings" element={<Settings />} />
        <Route path="/" element={<Home />} />
      </Routes>,
      {
        initialEntries: ['/settings'],
        preloadedState: loadedAppState([]),
      }
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

    renderWithAppShell(<Settings />, {
      initialEntries: ['/settings'],
      preloadedState: loadedAppState([]),
    })

    expect(document.getElementById('Settings-page')).toBeTruthy()
    expect(screen.getByRole('status')).toBeTruthy()
  })
})
