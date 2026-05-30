import { act, renderHook, waitFor } from '@testing-library/react'
import React, { type PropsWithChildren } from 'react'
import { Provider } from 'react-redux'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  createHookTestStore,
  resetHookTestStoreToasts,
} from './test-utils/createHookTestStore'

const {
  signUpMock,
  signInMock,
  confirmSignUpMock,
  resendSignUpCodeMock,
  userFromCognitoSessionMock,
  MockAuthError,
} = vi.hoisted(() => {
  class MockAuthError extends Error {
    override name = 'AuthError'
  }
  return {
    signUpMock: vi.fn(),
    signInMock: vi.fn(),
    confirmSignUpMock: vi.fn(),
    resendSignUpCodeMock: vi.fn(),
    userFromCognitoSessionMock: vi.fn(),
    MockAuthError,
  }
})

vi.mock('aws-amplify/auth', () => ({
  AuthError: MockAuthError,
  signUp: signUpMock,
  signIn: signInMock,
  confirmSignUp: confirmSignUpMock,
  resendSignUpCode: resendSignUpCodeMock,
}))

vi.mock('./cognitoSession', () => ({
  userFromCognitoSession: userFromCognitoSessionMock,
}))

import { useCognitoSignUp } from './useCognitoSignUp'

const registerMessages = {
  acceptedTerms: true,
  termsRequiredMessage: 'terms-required',
  mismatchMessage: 'mismatch',
  codeSentMessage: 'code-sent',
  unexpectedNextStepMessage: 'unexpected-step',
  unexpectedErrorMessage: 'unexpected-error',
  signedInMessage: 'signed-in',
  termsAcceptFailedMessage: 'terms-failed',
}

const confirmMessages = {
  signedInMessage: 'signed-in',
  unexpectedErrorMessage: 'confirm-error',
  termsAcceptFailedMessage: 'terms-failed',
}

function createWrapper(store: ReturnType<typeof createHookTestStore>) {
  return function Wrapper({ children }: PropsWithChildren) {
    return <Provider store={store}>{children}</Provider>
  }
}

describe('useCognitoSignUp', () => {
  beforeEach(() => {
    signUpMock.mockReset()
    signInMock.mockReset()
    confirmSignUpMock.mockReset()
    resendSignUpCodeMock.mockReset()
    userFromCognitoSessionMock.mockReset()
    resetHookTestStoreToasts()
  })

  it('warns when terms are not accepted', async () => {
    const store = createHookTestStore()
    const { result } = renderHook(() => useCognitoSignUp(vi.fn()), {
      wrapper: createWrapper(store),
    })

    await act(async () => {
      await result.current.handleRegister(
        { preventDefault: vi.fn() } as unknown as React.FormEvent,
        { ...registerMessages, acceptedTerms: false }
      )
    })

    expect(store.getState().toasts[0]?.body).toBe('terms-required')
    expect(signUpMock).not.toHaveBeenCalled()
  })

  it('warns when passwords do not match', async () => {
    const store = createHookTestStore()
    const { result } = renderHook(() => useCognitoSignUp(vi.fn()), {
      wrapper: createWrapper(store),
    })

    act(() => {
      result.current.setPassword('one')
      result.current.setConfirmPassword('two')
    })

    await act(async () => {
      await result.current.handleRegister(
        { preventDefault: vi.fn() } as unknown as React.FormEvent,
        registerMessages
      )
    })

    expect(store.getState().toasts[0]?.body).toBe('mismatch')
    expect(signUpMock).not.toHaveBeenCalled()
  })

  it('auto signs in when registration completes immediately', async () => {
    const store = createHookTestStore()
    const onSignedIn = vi.fn()
    signUpMock.mockResolvedValue({
      isSignUpComplete: true,
      nextStep: { signUpStep: 'DONE' },
    })
    signInMock.mockResolvedValue({ isSignedIn: true })
    userFromCognitoSessionMock.mockResolvedValue({
      email: 'user@example.com',
      userId: 'sub-1',
    })

    const { result } = renderHook(() => useCognitoSignUp(onSignedIn), {
      wrapper: createWrapper(store),
    })

    act(() => {
      result.current.setEmail('user@example.com')
      result.current.setPassword('password1')
      result.current.setConfirmPassword('password1')
    })

    await act(async () => {
      await result.current.handleRegister(
        { preventDefault: vi.fn() } as unknown as React.FormEvent,
        registerMessages
      )
    })

    await waitFor(() => expect(onSignedIn).toHaveBeenCalled())
    expect(store.getState().user.email).toBe('user@example.com')
    expect(store.getState().toasts.some((t) => t.body === 'signed-in')).toBe(
      true
    )
  })

  it('moves to confirm step when Cognito requires verification', async () => {
    const store = createHookTestStore()
    signUpMock.mockResolvedValue({
      isSignUpComplete: false,
      nextStep: { signUpStep: 'CONFIRM_SIGN_UP' },
    })

    const { result } = renderHook(() => useCognitoSignUp(vi.fn()), {
      wrapper: createWrapper(store),
    })

    act(() => {
      result.current.setPassword('password1')
      result.current.setConfirmPassword('password1')
    })

    await act(async () => {
      await result.current.handleRegister(
        { preventDefault: vi.fn() } as unknown as React.FormEvent,
        registerMessages
      )
    })

    await waitFor(() => expect(result.current.step).toBe('confirm'))
    expect(store.getState().toasts[0]?.body).toBe('code-sent')
  })

  it('warns on unexpected sign-up next step', async () => {
    const store = createHookTestStore()
    signUpMock.mockResolvedValue({
      isSignUpComplete: false,
      nextStep: { signUpStep: 'UNKNOWN' },
    })

    const { result } = renderHook(() => useCognitoSignUp(vi.fn()), {
      wrapper: createWrapper(store),
    })

    act(() => {
      result.current.setPassword('password1')
      result.current.setConfirmPassword('password1')
    })

    await act(async () => {
      await result.current.handleRegister(
        { preventDefault: vi.fn() } as unknown as React.FormEvent,
        registerMessages
      )
    })

    await waitFor(() => expect(result.current.busy).toBe(false))
    expect(store.getState().toasts[0]?.body).toBe('unexpected-step')
  })

  it('surfaces sign-up errors', async () => {
    const store = createHookTestStore()
    signUpMock.mockRejectedValue(new MockAuthError('Sign up failed'))

    const { result } = renderHook(() => useCognitoSignUp(vi.fn()), {
      wrapper: createWrapper(store),
    })

    act(() => {
      result.current.setPassword('password1')
      result.current.setConfirmPassword('password1')
    })

    await act(async () => {
      await result.current.handleRegister(
        { preventDefault: vi.fn() } as unknown as React.FormEvent,
        registerMessages
      )
    })

    await waitFor(() => expect(result.current.busy).toBe(false))
    expect(store.getState().toasts[0]?.body).toBe('Sign up failed')
  })

  it('confirms sign-up and finishes signed-in flow', async () => {
    const store = createHookTestStore()
    const onSignedIn = vi.fn()
    confirmSignUpMock.mockResolvedValue(undefined)
    signInMock.mockResolvedValue({ isSignedIn: true })
    userFromCognitoSessionMock.mockResolvedValue({
      email: 'user@example.com',
      userId: 'sub-1',
    })

    const { result } = renderHook(() => useCognitoSignUp(onSignedIn), {
      wrapper: createWrapper(store),
    })

    act(() => {
      result.current.setEmail('user@example.com')
      result.current.setPassword('password1')
      result.current.setCode('123456')
    })

    await act(async () => {
      await result.current.handleConfirm(
        { preventDefault: vi.fn() } as unknown as React.FormEvent,
        confirmMessages
      )
    })

    await waitFor(() => expect(onSignedIn).toHaveBeenCalled())
    expect(confirmSignUpMock).toHaveBeenCalledWith({
      username: 'user@example.com',
      confirmationCode: '123456',
    })
  })

  it('navigates after unsupported sign-in challenge', async () => {
    const store = createHookTestStore()
    const onSignedIn = vi.fn()
    signUpMock.mockResolvedValue({
      isSignUpComplete: true,
      nextStep: { signUpStep: 'DONE' },
    })
    signInMock.mockResolvedValue({ isSignedIn: false })

    const { result } = renderHook(() => useCognitoSignUp(onSignedIn), {
      wrapper: createWrapper(store),
    })

    act(() => {
      result.current.setPassword('password1')
      result.current.setConfirmPassword('password1')
    })

    await act(async () => {
      await result.current.handleRegister(
        { preventDefault: vi.fn() } as unknown as React.FormEvent,
        registerMessages
      )
    })

    await waitFor(() => expect(onSignedIn).toHaveBeenCalled())
    expect(store.getState().toasts[0]?.body).toBe(
      'auth.signInChallengeNotSupported'
    )
  })

  it('blocks finish when terms acceptance fails', async () => {
    const store = createHookTestStore()
    const onSignedIn = vi.fn()
    signUpMock.mockResolvedValue({
      isSignUpComplete: true,
      nextStep: { signUpStep: 'DONE' },
    })
    signInMock.mockResolvedValue({ isSignedIn: true })

    const { result } = renderHook(
      () =>
        useCognitoSignUp(onSignedIn, {
          recordTermsAcceptance: vi.fn().mockRejectedValue(new Error('fail')),
        }),
      { wrapper: createWrapper(store) }
    )

    act(() => {
      result.current.setPassword('password1')
      result.current.setConfirmPassword('password1')
    })

    await act(async () => {
      await result.current.handleRegister(
        { preventDefault: vi.fn() } as unknown as React.FormEvent,
        registerMessages
      )
    })

    await waitFor(() => expect(result.current.busy).toBe(false))
    expect(onSignedIn).not.toHaveBeenCalled()
    expect(store.getState().toasts[0]?.body).toBe('terms-failed')
  })

  it('resends confirmation code', async () => {
    const store = createHookTestStore()
    resendSignUpCodeMock.mockResolvedValue(undefined)

    const { result } = renderHook(() => useCognitoSignUp(vi.fn()), {
      wrapper: createWrapper(store),
    })

    act(() => {
      result.current.setEmail('user@example.com')
    })

    await act(async () => {
      await result.current.handleResend({
        resentMessage: 'resent',
        unexpectedErrorMessage: 'resend-error',
      })
    })

    await waitFor(() => expect(result.current.busy).toBe(false))
    expect(resendSignUpCodeMock).toHaveBeenCalledWith({
      username: 'user@example.com',
    })
    expect(store.getState().toasts[0]?.body).toBe('resent')
  })
})
