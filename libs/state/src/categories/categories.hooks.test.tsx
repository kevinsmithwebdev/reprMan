import { describe, expect, it } from 'vitest'
import React from 'react'
import { Provider } from 'react-redux'
import { renderHook } from '@testing-library/react'

import { createTestStore } from '../../../../apps/client-web/src/test-utils/createTestStore'
import { useCategories } from './categories.hooks'

const wrapper =
  (store: ReturnType<typeof createTestStore>) =>
  ({ children }: { children: React.ReactNode }) =>
    <Provider store={store}>{children}</Provider>

describe('useCategories', () => {
  it('reads categories and filter from the store', () => {
    const store = createTestStore({
      categories: {
        categories: ['jazz'],
        filter: { text: 'q', categories: ['jazz'] },
      },
    })
    const { result } = renderHook(() => useCategories(), {
      wrapper: wrapper(store),
    })

    expect(result.current.categories).toEqual(['jazz'])
    expect(result.current.filter).toEqual({ text: 'q', categories: ['jazz'] })
  })
})
