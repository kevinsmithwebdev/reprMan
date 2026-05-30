import { describe, expect, it } from 'vitest'

import type { RootState } from '../store'
import { selectReprs, selectReprsLoaded } from './reprs.selectors'

describe('reprs.selectors', () => {
  it('selectReprs returns an empty list when reprs state is null', () => {
    const state = { reprs: null } as RootState
    expect(selectReprs(state)).toEqual([])
  })

  it('selectReprsLoaded is false when reprs state is null', () => {
    const state = { reprs: null } as RootState
    expect(selectReprsLoaded(state)).toBe(false)
  })

  it('selectReprsLoaded is true when reprs have been loaded', () => {
    const state = { reprs: [] } as RootState
    expect(selectReprsLoaded(state)).toBe(true)
  })
})
