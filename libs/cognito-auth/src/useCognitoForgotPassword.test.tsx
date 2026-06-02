import { act, renderHook, waitFor } from '@testing-library/react'
import React, { type PropsWithChildren } from 'react'
import { Provider } from 'react-redux'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  createHookTestStore,
  resetHookTestStoreToasts,
} from './test-utils/createHookTestStore'

const { resetPasswordMock, confirmResetPasswordMock, MockAuthError } =
  vi.hoisted(() => {
    class MockAuthError extends Error {
      override name = 'AuthError'
    }
    return {
      resetPasswordMock: vi.fn(),
      confirmResetPasswordMock: vi.fn(),
      MockAuthError,
    }
  })

vi.mock('aws-amplify/auth', () => ({
  AuthError: MockAuthError,
  resetPassword: resetPasswordMock,
  confirmResetPassword: confirmResetPasswordMock,
}))

// eslint-disable-next-line import/first -- vi.mock is hoisted; source must load after factory runs
import { useCognitoForgotPassword } from './useCognitoForgotPassword'

const requestMessages = {
  codeSentMessage: 'code-sent',
  successMessage: 'request-success',
  unexpectedNextStepMessage: 'unexpected-step',
  unexpectedErrorMessage: 'request-error',
}

const confirmMessages = {
  mismatchMessage: 'mismatch',
  successMessage: 'confirm-success',
  unexpectedErrorMessage: 'confirm-error',
}

const createWrapper = (store: ReturnType<typeof createHookTestStore>) => {
  const Wrapper = ({ children }: PropsWithChildren) => (
    <Provider store={store}>{children}</Provider>
  )
  return Wrapper
}

describe('useCognitoForgotPassword', () => {
  beforeEach(() => {
    resetPasswordMock.mockReset()
    confirmResetPasswordMock.mockReset()
    resetHookTestStoreToasts()
  })

  it('moves to confirm step when Cognito sends a reset code', async () => {
    const store = createHookTestStore()
    resetPasswordMock.mockResolvedValue({
      nextStep: { resetPasswordStep: 'CONFIRM_RESET_PASSWORD_WITH_CODE' },
    })

    const { result } = renderHook(() => useCognitoForgotPassword(vi.fn()), {
      wrapper: createWrapper(store),
    })

    act(() => {
      result.current.setEmail(' user@example.com ')
    })

    await act(async () => {
      await result.current.handleRequest(
        { preventDefault: vi.fn() } as unknown as React.FormEvent,
        requestMessages
      )
    })

    await waitFor(() => expect(result.current.step).toBe('confirm'))
    expect(resetPasswordMock).toHaveBeenCalledWith({
      username: 'user@example.com',
    })
    expect(result.current.code).toBe('')
    expect(store.getState().toasts[0]?.body).toBe('code-sent')
  })

  it('completes immediately when reset finishes without a code step', async () => {
    const store = createHookTestStore()
    const onComplete = vi.fn()
    resetPasswordMock.mockResolvedValue({
      nextStep: { resetPasswordStep: 'DONE' },
    })

    const { result } = renderHook(() => useCognitoForgotPassword(onComplete), {
      wrapper: createWrapper(store),
    })

    await act(async () => {
      await result.current.handleRequest(
        { preventDefault: vi.fn() } as unknown as React.FormEvent,
        requestMessages
      )
    })

    await waitFor(() => expect(onComplete).toHaveBeenCalled())
    expect(store.getState().toasts[0]?.body).toBe('request-success')
  })

  it('warns on unexpected reset next step', async () => {
    const store = createHookTestStore()
    resetPasswordMock.mockResolvedValue({
      nextStep: { resetPasswordStep: 'UNKNOWN' },
    })

    const { result } = renderHook(() => useCognitoForgotPassword(vi.fn()), {
      wrapper: createWrapper(store),
    })

    await act(async () => {
      await result.current.handleRequest(
        { preventDefault: vi.fn() } as unknown as React.FormEvent,
        requestMessages
      )
    })

    await waitFor(() => expect(result.current.busy).toBe(false))
    expect(store.getState().toasts[0]?.body).toBe('unexpected-step')
  })

  it('surfaces request errors', async () => {
    const store = createHookTestStore()
    resetPasswordMock.mockRejectedValue(new MockAuthError('Reset failed'))

    const { result } = renderHook(() => useCognitoForgotPassword(vi.fn()), {
      wrapper: createWrapper(store),
    })

    await act(async () => {
      await result.current.handleRequest(
        { preventDefault: vi.fn() } as unknown as React.FormEvent,
        requestMessages
      )
    })

    await waitFor(() => expect(result.current.busy).toBe(false))
    expect(store.getState().toasts[0]?.body).toBe('Reset failed')
  })

  it('warns when confirm passwords do not match', async () => {
    const store = createHookTestStore()
    const { result } = renderHook(() => useCognitoForgotPassword(vi.fn()), {
      wrapper: createWrapper(store),
    })

    act(() => {
      result.current.setNewPassword('one')
      result.current.setConfirmPassword('two')
    })

    await act(async () => {
      await result.current.handleConfirm(
        { preventDefault: vi.fn() } as unknown as React.FormEvent,
        confirmMessages
      )
    })

    expect(store.getState().toasts[0]?.body).toBe('mismatch')
    expect(confirmResetPasswordMock).not.toHaveBeenCalled()
  })

  it('confirms reset password and completes', async () => {
    const store = createHookTestStore()
    const onComplete = vi.fn()
    confirmResetPasswordMock.mockResolvedValue(undefined)

    const { result } = renderHook(() => useCognitoForgotPassword(onComplete), {
      wrapper: createWrapper(store),
    })

    act(() => {
      result.current.setEmail('user@example.com')
      result.current.setCode(' 123456 ')
      result.current.setNewPassword('new-pass')
      result.current.setConfirmPassword('new-pass')
    })

    await act(async () => {
      await result.current.handleConfirm(
        { preventDefault: vi.fn() } as unknown as React.FormEvent,
        confirmMessages
      )
    })

    await waitFor(() => expect(onComplete).toHaveBeenCalled())
    expect(confirmResetPasswordMock).toHaveBeenCalledWith({
      username: 'user@example.com',
      confirmationCode: '123456',
      newPassword: 'new-pass',
    })
    expect(store.getState().toasts[0]?.body).toBe('confirm-success')
  })

  it('resends reset code', async () => {
    const store = createHookTestStore()
    resetPasswordMock.mockResolvedValue({
      nextStep: { resetPasswordStep: 'CONFIRM_RESET_PASSWORD_WITH_CODE' },
    })

    const { result } = renderHook(() => useCognitoForgotPassword(vi.fn()), {
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
    expect(store.getState().toasts[0]?.body).toBe('resent')
  })

  it('resets local confirm-step state', async () => {
    const store = createHookTestStore()
    resetPasswordMock.mockResolvedValue({
      nextStep: { resetPasswordStep: 'CONFIRM_RESET_PASSWORD_WITH_CODE' },
    })

    const { result } = renderHook(() => useCognitoForgotPassword(vi.fn()), {
      wrapper: createWrapper(store),
    })

    await act(async () => {
      await result.current.handleRequest(
        { preventDefault: vi.fn() } as unknown as React.FormEvent,
        requestMessages
      )
    })
    await waitFor(() => expect(result.current.step).toBe('confirm'))

    act(() => {
      result.current.setCode('123')
      result.current.setNewPassword('a')
      result.current.setConfirmPassword('a')
      result.current.reset()
    })

    expect(result.current.step).toBe('request')
    expect(result.current.code).toBe('')
    expect(result.current.newPassword).toBe('')
    expect(result.current.confirmPassword).toBe('')
  })
})
