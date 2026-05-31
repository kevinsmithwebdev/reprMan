import { act, renderHook, waitFor } from '@testing-library/react'
import React, { type PropsWithChildren } from 'react'
import { Provider } from 'react-redux'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  createHookTestStore,
  resetHookTestStoreToasts,
} from './test-utils/createHookTestStore'

const { updatePasswordMock, MockAuthError } = vi.hoisted(() => {
  class MockAuthError extends Error {
    override name = 'AuthError'
  }
  return { updatePasswordMock: vi.fn(), MockAuthError }
})

vi.mock('aws-amplify/auth', () => ({
  AuthError: MockAuthError,
  updatePassword: updatePasswordMock,
}))

vi.mock('@reprman/localization', () => ({
  useL10n: () => ({ t: (key: string) => key }),
}))

// eslint-disable-next-line import/first -- vi.mock is hoisted; source must load after factory runs
import { useCognitoChangePassword } from './useCognitoChangePassword'

const createWrapper = (store: ReturnType<typeof createHookTestStore>) => {
  const Wrapper = ({ children }: PropsWithChildren) => (
    <Provider store={store}>{children}</Provider>
  )
  return Wrapper
}

describe('useCognitoChangePassword', () => {
  beforeEach(() => {
    updatePasswordMock.mockReset()
    resetHookTestStoreToasts()
  })

  it('warns when new passwords do not match', async () => {
    const store = createHookTestStore()
    const { result } = renderHook(() => useCognitoChangePassword(), {
      wrapper: createWrapper(store),
    })

    act(() => {
      result.current.setNewPassword('one')
      result.current.setConfirmPassword('two')
    })

    await act(async () => {
      await result.current.handleSubmit({
        preventDefault: vi.fn(),
      } as unknown as React.FormEvent)
    })

    expect(store.getState().toasts[0]?.body).toBe('auth.changePasswordMismatch')
    expect(updatePasswordMock).not.toHaveBeenCalled()
  })

  it('updates password and clears fields on success', async () => {
    const store = createHookTestStore()
    const onSuccess = vi.fn()
    updatePasswordMock.mockResolvedValue(undefined)

    const { result } = renderHook(() => useCognitoChangePassword(onSuccess), {
      wrapper: createWrapper(store),
    })

    act(() => {
      result.current.setOldPassword('old')
      result.current.setNewPassword('new-pass')
      result.current.setConfirmPassword('new-pass')
    })

    await act(async () => {
      await result.current.handleSubmit({
        preventDefault: vi.fn(),
      } as unknown as React.FormEvent)
    })

    await waitFor(() => expect(result.current.busy).toBe(false))

    expect(updatePasswordMock).toHaveBeenCalledWith({
      oldPassword: 'old',
      newPassword: 'new-pass',
    })
    expect(onSuccess).toHaveBeenCalled()
    expect(result.current.oldPassword).toBe('')
    expect(result.current.newPassword).toBe('')
    expect(result.current.confirmPassword).toBe('')
    expect(store.getState().toasts[0]?.body).toBe('auth.changePasswordSuccess')
  })

  it('shows AuthError message in a toast', async () => {
    const store = createHookTestStore()
    updatePasswordMock.mockRejectedValue(new MockAuthError('Wrong password'))

    const { result } = renderHook(() => useCognitoChangePassword(), {
      wrapper: createWrapper(store),
    })

    act(() => {
      result.current.setNewPassword('new-pass')
      result.current.setConfirmPassword('new-pass')
    })

    await act(async () => {
      await result.current.handleSubmit({
        preventDefault: vi.fn(),
      } as unknown as React.FormEvent)
    })

    await waitFor(() => expect(result.current.busy).toBe(false))
    expect(store.getState().toasts[0]?.body).toBe('Wrong password')
  })

  it('shows fallback toast for unexpected errors', async () => {
    const store = createHookTestStore()
    updatePasswordMock.mockRejectedValue(new Error('network down'))

    const { result } = renderHook(() => useCognitoChangePassword(), {
      wrapper: createWrapper(store),
    })

    act(() => {
      result.current.setNewPassword('new-pass')
      result.current.setConfirmPassword('new-pass')
    })

    await act(async () => {
      await result.current.handleSubmit({
        preventDefault: vi.fn(),
      } as unknown as React.FormEvent)
    })

    await waitFor(() => expect(result.current.busy).toBe(false))
    expect(store.getState().toasts[0]?.body).toBe('auth.signInUnexpectedError')
  })
})
