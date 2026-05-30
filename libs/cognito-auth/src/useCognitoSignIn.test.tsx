import { act, renderHook, waitFor } from '@testing-library/react'
import React, { type PropsWithChildren } from 'react'
import { Provider } from 'react-redux'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createHookTestStore, resetHookTestStoreToasts } from './test-utils/createHookTestStore'

const { signInMock, MockAuthError } = vi.hoisted(() => {
  class MockAuthError extends Error {
    override name = 'AuthError'
  }
  return { signInMock: vi.fn(), MockAuthError }
})

vi.mock('aws-amplify/auth', () => ({
  AuthError: MockAuthError,
  signIn: signInMock,
}))

vi.mock('@reprman/localization', () => ({
  useL10n: () => ({ t: (key: string) => key }),
}))

import { useCognitoSignIn } from './useCognitoSignIn'

function createWrapper(store: ReturnType<typeof createHookTestStore>) {
  return function Wrapper({ children }: PropsWithChildren) {
    return <Provider store={store}>{children}</Provider>
  }
}

describe('useCognitoSignIn', () => {
  beforeEach(() => {
    signInMock.mockReset()
    resetHookTestStoreToasts()
  })

  it('exposes form state and translation helper', () => {
    const store = createHookTestStore()
    const { result } = renderHook(
      () => useCognitoSignIn(vi.fn(), vi.fn()),
      { wrapper: createWrapper(store) }
    )

    expect(result.current.email).toBe('')
    expect(result.current.password).toBe('')
    expect(result.current.busy).toBe(false)
    expect(result.current.t('auth.signInButton')).toBe('auth.signInButton')
  })

  it('signs in, refreshes session, and clears password on success', async () => {
    const store = createHookTestStore()
    const refreshSession = vi.fn().mockResolvedValue(undefined)
    const onSuccess = vi.fn()
    signInMock.mockResolvedValue({ isSignedIn: true })

    const { result } = renderHook(
      () => useCognitoSignIn(refreshSession, onSuccess),
      { wrapper: createWrapper(store) }
    )

    act(() => {
      result.current.setEmail(' user@example.com ')
      result.current.setPassword('secret')
    })

    await act(async () => {
      await result.current.handleSignIn({
        preventDefault: vi.fn(),
      } as unknown as React.FormEvent)
    })

    await waitFor(() => expect(result.current.busy).toBe(false))

    expect(signInMock).toHaveBeenCalledWith({
      username: 'user@example.com',
      password: 'secret',
    })
    expect(refreshSession).toHaveBeenCalled()
    expect(onSuccess).toHaveBeenCalled()
    expect(result.current.password).toBe('')
    expect(store.getState().toasts).toHaveLength(0)
  })

  it('warns when Cognito returns an unsupported challenge', async () => {
    const store = createHookTestStore()
    signInMock.mockResolvedValue({ isSignedIn: false })

    const { result } = renderHook(
      () => useCognitoSignIn(vi.fn(), vi.fn()),
      { wrapper: createWrapper(store) }
    )

    await act(async () => {
      await result.current.handleSignIn({
        preventDefault: vi.fn(),
      } as unknown as React.FormEvent)
    })

    await waitFor(() => expect(result.current.busy).toBe(false))
    expect(store.getState().toasts[0]?.body).toBe(
      'auth.signInChallengeNotSupported'
    )
  })

  it('shows AuthError message in a toast', async () => {
    const store = createHookTestStore()
    signInMock.mockRejectedValue(new MockAuthError('Invalid credentials'))

    const { result } = renderHook(
      () => useCognitoSignIn(vi.fn(), vi.fn()),
      { wrapper: createWrapper(store) }
    )

    await act(async () => {
      await result.current.handleSignIn({
        preventDefault: vi.fn(),
      } as unknown as React.FormEvent)
    })

    await waitFor(() => expect(result.current.busy).toBe(false))
    expect(store.getState().toasts[0]?.body).toBe('Invalid credentials')
  })

  it('shows fallback toast for unexpected errors', async () => {
    const store = createHookTestStore()
    signInMock.mockRejectedValue(new Error('network down'))

    const { result } = renderHook(
      () => useCognitoSignIn(vi.fn(), vi.fn()),
      { wrapper: createWrapper(store) }
    )

    await act(async () => {
      await result.current.handleSignIn({
        preventDefault: vi.fn(),
      } as unknown as React.FormEvent)
    })

    await waitFor(() => expect(result.current.busy).toBe(false))
    expect(store.getState().toasts[0]?.body).toBe('auth.signInUnexpectedError')
  })
})
