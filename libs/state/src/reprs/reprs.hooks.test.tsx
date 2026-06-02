import { describe, expect, it } from 'vitest'
import React from 'react'
import { Provider } from 'react-redux'
import { renderHook } from '@testing-library/react'
import type { Repr } from '@reprman/types'

import { createTestStore } from '../../../../apps/client-web/src/test-utils/createTestStore'
import { useReprs } from './reprs.hooks'

const repr = (id: string): Repr => ({
  id,
  title: `Repr ${id}`,
  categories: [],
  dateCreated: 0,
  datesPracticed: [],
  comment: '',
  learning: false,
})

const wrapper =
  (store: ReturnType<typeof createTestStore>) =>
  ({ children }: { children: React.ReactNode }) =>
    <Provider store={store}>{children}</Provider>

describe('useReprs', () => {
  it('reports unloaded state and empty list when reprs is null', () => {
    const store = createTestStore({ reprs: null })
    const { result } = renderHook(() => useReprs(), {
      wrapper: wrapper(store),
    })

    expect(result.current.reprs).toEqual([])
    expect(result.current.reprsLoaded).toBe(false)
    expect(result.current.getRepr('r1')).toBeUndefined()
    expect(result.current.getRepr(undefined)).toBeUndefined()
  })

  it('returns reprs and resolves by id when loaded', () => {
    const reprs = [repr('a'), repr('b')]
    const store = createTestStore({ reprs })
    const { result } = renderHook(() => useReprs(), {
      wrapper: wrapper(store),
    })

    expect(result.current.reprs).toEqual(reprs)
    expect(result.current.reprsLoaded).toBe(true)
    expect(result.current.getRepr('b')?.title).toBe('Repr b')
    expect(result.current.getRepr('missing')).toBeUndefined()
  })
})
