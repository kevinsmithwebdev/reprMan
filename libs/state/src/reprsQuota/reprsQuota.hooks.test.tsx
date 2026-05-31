import { describe, expect, it } from 'vitest'
import React from 'react'
import { Provider } from 'react-redux'
import { renderHook } from '@testing-library/react'

import { createTestStore } from '../../../../apps/client-web/src/test-utils/createTestStore'
import { useReprCreationCap } from './reprsQuota.hooks'

const wrapper =
  (store: ReturnType<typeof createTestStore>) =>
  ({ children }: { children: React.ReactNode }) =>
    <Provider store={store}>{children}</Provider>

describe('useReprCreationCap', () => {
  it('reflects quota selectors from the store', () => {
    const store = createTestStore({
      reprsQuota: { maxReprsAllowed: 7 },
    })
    const { result } = renderHook(() => useReprCreationCap(), {
      wrapper: wrapper(store),
    })

    expect(result.current.quotaLoaded).toBe(true)
    expect(result.current.reprCreationCap).toBe(7)
  })

  it('reports unloaded quota before maxReprsAllowed is set', () => {
    const store = createTestStore({
      reprsQuota: { maxReprsAllowed: undefined },
    })
    const { result } = renderHook(() => useReprCreationCap(), {
      wrapper: wrapper(store),
    })

    expect(result.current.quotaLoaded).toBe(false)
    expect(result.current.reprCreationCap).toBeUndefined()
  })
})
