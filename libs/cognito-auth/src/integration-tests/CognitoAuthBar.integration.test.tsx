import { fireEvent, screen, waitFor } from '@testing-library/react'
import React from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import {
  navigationMocks,
  renderWithAppShell,
} from '../../../../apps/client-web/src/test-utils'
import CognitoAuthBar from '../CognitoAuthBar'

const { signOutMock, deleteUserMock, MockAuthError, useCognitoAuthMock } =
  vi.hoisted(() => {
    class MockAuthError extends Error {
      override name = 'AuthError'
    }
    return {
      signOutMock: vi.fn(),
      deleteUserMock: vi.fn(),
      MockAuthError,
      useCognitoAuthMock: vi.fn(() => ({
        sessionChecked: true,
        signedIn: false,
        refreshSession: vi.fn(),
      })),
    }
  })

vi.mock('aws-amplify/auth', () => ({
  AuthError: MockAuthError,
  signOut: signOutMock,
  deleteUser: deleteUserMock,
}))

vi.mock('@reprman/localization', () => ({
  useL10n: () => ({ t: (key: string) => key }),
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

vi.mock('../cognitoSession', () => ({
  userFromCognitoSession: vi.fn().mockResolvedValue(null),
}))

vi.mock('../CognitoAuthContext', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../CognitoAuthContext')>()
  return {
    ...actual,
    useCognitoAuth: useCognitoAuthMock,
  }
})

describe('CognitoAuthBar (integration)', () => {
  beforeEach(() => {
    signOutMock.mockReset()
    deleteUserMock.mockReset()
    navigationMocks.push.mockReset()
    navigationMocks.replace.mockReset()
    signOutMock.mockResolvedValue(undefined)
    deleteUserMock.mockResolvedValue(undefined)
    useCognitoAuthMock.mockReturnValue({
      sessionChecked: true,
      signedIn: false,
      refreshSession: vi.fn(),
    })
  })

  it('shows spinner while session is unchecked', () => {
    useCognitoAuthMock.mockReturnValue({
      sessionChecked: false,
      signedIn: false,
      refreshSession: vi.fn(),
    })

    renderWithAppShell(<CognitoAuthBar />)
    expect(screen.getByRole('status')).toBeTruthy()
  })

  it('shows sign-in button when signed out', () => {
    renderWithAppShell(<CognitoAuthBar />)
    expect(document.getElementById('cognito-sign-in-open')).toBeTruthy()
  })

  it('shows avatar menu for signed-in user and signs out', async () => {
    useCognitoAuthMock.mockReturnValue({
      sessionChecked: true,
      signedIn: true,
      refreshSession: vi.fn(),
    })

    const { store } = renderWithAppShell(<CognitoAuthBar />, {
      preloadedState: {
        user: {
          email: 'user@example.com',
          userId: 'sub-1',
          name: 'Jane Doe',
        },
      },
    })

    expect(screen.getByText('JD')).toBeTruthy()
    fireEvent.click(document.getElementById('cognito-user-avatar-toggle')!)
    fireEvent.click(document.getElementById('cognito-sign-out')!)
    await Promise.resolve()

    expect(signOutMock).toHaveBeenCalled()
    expect(store.getState().user).toEqual({ email: '' })
  })

  it('deletes account from confirmation modal', async () => {
    useCognitoAuthMock.mockReturnValue({
      sessionChecked: true,
      signedIn: true,
      refreshSession: vi.fn(),
    })

    const { store } = renderWithAppShell(<CognitoAuthBar />, {
      preloadedState: {
        user: {
          email: 'user@example.com',
          userId: 'sub-1',
          name: 'Jane Doe',
        },
      },
    })

    fireEvent.click(document.getElementById('cognito-user-avatar-toggle')!)
    fireEvent.click(document.getElementById('cognito-delete-account')!)
    expect(screen.getByRole('dialog')).toBeTruthy()

    const deleteButtons = screen.getAllByRole('button', {
      name: 'auth.deleteAccount',
    })
    fireEvent.click(deleteButtons.at(-1)!)

    await waitFor(() => {
      expect(deleteUserMock).toHaveBeenCalled()
      expect(store.getState().user).toEqual({ email: '' })
      expect(navigationMocks.replace).toHaveBeenCalledWith('/')
    })
  })

  it('navigates to terms and change-password from menu', async () => {
    useCognitoAuthMock.mockReturnValue({
      sessionChecked: true,
      signedIn: true,
      refreshSession: vi.fn(),
    })

    renderWithAppShell(<CognitoAuthBar />, {
      preloadedState: {
        user: {
          email: 'user@example.com',
          userId: 'sub-1',
          name: 'Jane Doe',
        },
        reprsQuota: {
          subscription: {
            status: 'trial',
            expiration: '2026-08-01T00:00:00.000Z',
            maxReprs: 100,
          },
        },
      },
    })

    fireEvent.click(document.getElementById('cognito-user-avatar-toggle')!)
    expect(screen.getByText('Jane Doe')).toBeTruthy()
    expect(document.getElementById('cognito-user-subscription')).toBeTruthy()
    expect(screen.getByText('billing.subscriptionLabel')).toBeTruthy()
    expect(screen.getByText('billing.status.trial')).toBeTruthy()
    fireEvent.click(document.getElementById('cognito-terms-of-use')!)
    expect(navigationMocks.push).toHaveBeenCalledWith('/terms')

    navigationMocks.push.mockClear()
    fireEvent.click(document.getElementById('cognito-change-password')!)
    expect(navigationMocks.push).toHaveBeenCalledWith('/change-password')
  })

  it('shows auth error toast when sign-out fails', async () => {
    useCognitoAuthMock.mockReturnValue({
      sessionChecked: true,
      signedIn: true,
      refreshSession: vi.fn(),
    })
    signOutMock.mockRejectedValue(new MockAuthError('Sign out failed'))

    renderWithAppShell(<CognitoAuthBar />, {
      preloadedState: {
        user: { email: 'user@example.com', userId: 'sub-1' },
      },
    })

    fireEvent.click(document.getElementById('cognito-user-avatar-toggle')!)
    fireEvent.click(document.getElementById('cognito-sign-out')!)
    await Promise.resolve()

    expect(signOutMock).toHaveBeenCalled()
    expect(navigationMocks.push).not.toHaveBeenCalled()
    expect(navigationMocks.replace).not.toHaveBeenCalled()
  })

  it('shows auth error toast when delete account fails', async () => {
    useCognitoAuthMock.mockReturnValue({
      sessionChecked: true,
      signedIn: true,
      refreshSession: vi.fn(),
    })
    deleteUserMock.mockRejectedValue(new MockAuthError('Delete failed'))

    renderWithAppShell(<CognitoAuthBar />, {
      preloadedState: {
        user: { email: 'user@example.com', userId: 'sub-1' },
      },
    })

    fireEvent.click(document.getElementById('cognito-user-avatar-toggle')!)
    fireEvent.click(document.getElementById('cognito-delete-account')!)
    const deleteButtons = screen.getAllByRole('button', {
      name: 'auth.deleteAccount',
    })
    fireEvent.click(deleteButtons.at(-1)!)
    await Promise.resolve()

    expect(deleteUserMock).toHaveBeenCalled()
    expect(navigationMocks.push).not.toHaveBeenCalled()
    expect(navigationMocks.replace).not.toHaveBeenCalled()
  })

  it('closes delete-account modal from cancel', async () => {
    useCognitoAuthMock.mockReturnValue({
      sessionChecked: true,
      signedIn: true,
      refreshSession: vi.fn(),
    })

    renderWithAppShell(<CognitoAuthBar />, {
      preloadedState: {
        user: { email: 'user@example.com', userId: 'sub-1' },
      },
    })

    fireEvent.click(document.getElementById('cognito-user-avatar-toggle')!)
    fireEvent.click(document.getElementById('cognito-delete-account')!)
    fireEvent.click(screen.getByRole('button', { name: 'auth.cancel' }))
    expect(screen.queryByRole('dialog')).toBeNull()
  })
})
