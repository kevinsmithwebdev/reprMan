import { describe, expect, it } from 'vitest'
import React from 'react'
import { Provider } from 'react-redux'
import { renderHook } from '@testing-library/react'
import { ToastLevel } from '@reprman/types'

import { createTestStore } from '../../../../apps/client-web/src/test-utils/createTestStore'
import { useToasts } from './toasts.hooks'

const wrapper =
  (store: ReturnType<typeof createTestStore>) =>
  ({ children }: { children: React.ReactNode }) =>
    <Provider store={store}>{children}</Provider>

describe('useToasts', () => {
  it('reads toasts from the store', () => {
    const toasts = [{ id: '1', title: 'T', body: 'B', level: ToastLevel.INFO }]
    const store = createTestStore({ toasts })
    const { result } = renderHook(() => useToasts(), {
      wrapper: wrapper(store),
    })

    expect(result.current.toasts).toEqual(toasts)
  })
})
