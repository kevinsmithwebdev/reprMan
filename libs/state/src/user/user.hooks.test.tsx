import { describe, expect, it } from 'vitest'
import React from 'react'
import { Provider } from 'react-redux'
import { renderHook } from '@testing-library/react'

import { createTestStore } from '../../../../apps/client-web/src/test-utils/createTestStore'
import { useUser } from './user.hooks'

const wrapper =
  (store: ReturnType<typeof createTestStore>) =>
  ({ children }: { children: React.ReactNode }) =>
    <Provider store={store}>{children}</Provider>

describe('useUser', () => {
  it('reads user from the store', () => {
    const user = { email: 'user@example.com' }
    const store = createTestStore({ user })
    const { result } = renderHook(() => useUser(), {
      wrapper: wrapper(store),
    })

    expect(result.current.user).toEqual(user)
  })
})
