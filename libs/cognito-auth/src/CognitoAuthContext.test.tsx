import { render, screen, waitFor } from '@testing-library/react'
import React from 'react'
import { Provider } from 'react-redux'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createTestStore } from '../../../apps/client-web/src/test-utils/createTestStore'

const { userFromCognitoSessionMock } = vi.hoisted(() => ({
  userFromCognitoSessionMock: vi.fn(),
}))

vi.mock('./cognitoSession', () => ({
  userFromCognitoSession: userFromCognitoSessionMock,
}))

vi.mock('@reprman/cognito-auth/configureAmplify', async (importOriginal) => {
  const actual = await importOriginal<
    typeof import('@reprman/cognito-auth/configureAmplify')
  >()
  return {
    ...actual,
    isCognitoConfigured: () => true,
  }
})

import {
  CognitoAuthProvider,
  useCognitoAuth,
} from './CognitoAuthContext'

function AuthProbe() {
  const auth = useCognitoAuth()
  return (
    <div
      data-testid="auth-probe"
      data-session-checked={String(auth.sessionChecked)}
      data-signed-in={String(auth.signedIn)}
    />
  )
}

describe('CognitoAuthContext', () => {
  beforeEach(() => {
    userFromCognitoSessionMock.mockReset()
  })

  it('throws when useCognitoAuth is used outside the provider', () => {
    const Broken = () => {
      useCognitoAuth()
      return null
    }

    expect(() => render(<Broken />)).toThrow(
      /useCognitoAuth must be used within CognitoAuthProvider/
    )
  })

  it('hydrates Redux user from Cognito on refresh', async () => {
    userFromCognitoSessionMock.mockResolvedValue({
      email: 'user@example.com',
      userId: 'sub-1',
      name: 'Jane Doe',
    })

    const store = createTestStore()
    render(
      <Provider store={store}>
        <CognitoAuthProvider>
          <AuthProbe />
        </CognitoAuthProvider>
      </Provider>
    )

    await waitFor(() =>
      expect(screen.getByTestId('auth-probe')).toHaveAttribute(
        'data-signed-in',
        'true'
      )
    )
    expect(store.getState().user).toEqual({
      email: 'user@example.com',
      userId: 'sub-1',
      name: 'Jane Doe',
    })
  })

  it('clears Redux user when Cognito session is missing', async () => {
    userFromCognitoSessionMock.mockResolvedValue(null)

    const store = createTestStore({
      user: { email: 'stale@example.com', userId: 'stale-sub' },
    })

    render(
      <Provider store={store}>
        <CognitoAuthProvider>
          <AuthProbe />
        </CognitoAuthProvider>
      </Provider>
    )

    await waitFor(() =>
      expect(screen.getByTestId('auth-probe')).toHaveAttribute(
        'data-signed-in',
        'false'
      )
    )
    expect(store.getState().user).toEqual({ email: '' })
  })

  it('clears Redux user when refresh throws', async () => {
    userFromCognitoSessionMock.mockRejectedValue(new Error('session error'))

    const store = createTestStore({
      user: { email: 'stale@example.com', userId: 'stale-sub' },
    })

    render(
      <Provider store={store}>
        <CognitoAuthProvider>
          <AuthProbe />
        </CognitoAuthProvider>
      </Provider>
    )

    await waitFor(() =>
      expect(screen.getByTestId('auth-probe')).toHaveAttribute(
        'data-session-checked',
        'true'
      )
    )
    expect(store.getState().user).toEqual({ email: '' })
  })
})
