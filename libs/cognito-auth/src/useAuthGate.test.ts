import { describe, expect, it, vi } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useAuthGate } from './useAuthGate'

vi.mock('./CognitoAuthContext', () => ({
  useCognitoAuth: () => ({
    signedIn: false,
    sessionChecked: true,
  }),
}))

vi.mock('./configureAmplify', () => ({
  homeAuthGateActive: () => true,
  isCognitoConfigured: () => true,
}))

describe('useAuthGate', () => {
  it('reports signed-out state when gate is active', () => {
    const { result } = renderHook(() => useAuthGate())
    expect(result.current.isSignedOut).toBe(true)
    expect(result.current.isLoading).toBe(false)
  })
})
