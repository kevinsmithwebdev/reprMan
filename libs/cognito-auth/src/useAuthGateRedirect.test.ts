import { renderHook, waitFor } from '@testing-library/react'
import { describe, expect, it, vi, beforeEach } from 'vitest'

import { useAuthGateRedirect } from './useAuthGateRedirect'

const mocks = vi.hoisted(() => ({
  signedIn: false,
  sessionChecked: true,
  homeAuthGateActive: true,
  isCognitoConfigured: true,
  onRedirect: vi.fn(),
}))

vi.mock('./CognitoAuthContext', () => ({
  useCognitoAuth: () => ({
    signedIn: mocks.signedIn,
    sessionChecked: mocks.sessionChecked,
  }),
}))

vi.mock('./configureAmplify', () => ({
  homeAuthGateActive: () => mocks.homeAuthGateActive,
  isCognitoConfigured: () => mocks.isCognitoConfigured,
}))

describe('useAuthGateRedirect', () => {
  beforeEach(() => {
    mocks.signedIn = false
    mocks.sessionChecked = true
    mocks.homeAuthGateActive = true
    mocks.isCognitoConfigured = true
    mocks.onRedirect.mockReset()
  })

  it('redirects signed-out users when the gate is active', async () => {
    renderHook(() =>
      useAuthGateRedirect({
        signedOutPath: '/signin',
        onRedirect: mocks.onRedirect,
      })
    )

    await waitFor(() => {
      expect(mocks.onRedirect).toHaveBeenCalledWith('/signin')
    })
    expect(
      renderHook(() =>
        useAuthGateRedirect({
          signedOutPath: '/signin',
          onRedirect: mocks.onRedirect,
        })
      ).result.current
    ).toEqual({ shouldRender: false, isLoading: false })
  })

  it('renders immediately when the auth gate is inactive', () => {
    mocks.homeAuthGateActive = false

    const { result } = renderHook(() =>
      useAuthGateRedirect({
        signedOutPath: '/signin',
        onRedirect: mocks.onRedirect,
      })
    )

    expect(result.current).toEqual({ shouldRender: true, isLoading: false })
    expect(mocks.onRedirect).not.toHaveBeenCalled()
  })

  it('shows loading while the session is unchecked', () => {
    mocks.sessionChecked = false

    const { result } = renderHook(() =>
      useAuthGateRedirect({
        signedOutPath: '/signin',
        onRedirect: mocks.onRedirect,
      })
    )

    expect(result.current).toEqual({ shouldRender: false, isLoading: true })
    expect(mocks.onRedirect).not.toHaveBeenCalled()
  })

  it('allows rendering for signed-in users', () => {
    mocks.signedIn = true

    const { result } = renderHook(() =>
      useAuthGateRedirect({
        signedOutPath: '/signin',
        onRedirect: mocks.onRedirect,
      })
    )

    expect(result.current).toEqual({ shouldRender: true, isLoading: false })
    expect(mocks.onRedirect).not.toHaveBeenCalled()
  })
})
