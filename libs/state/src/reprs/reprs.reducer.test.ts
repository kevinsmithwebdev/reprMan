import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Repr } from '@reprman/types'

import reducer from './reprs.reducer'
import { addRepr, clearAllReprs, resetReprs, setReprs } from './reprs.actions'

vi.mock('uuid', () => ({
  v4: () => 'mock-uuid',
}))

vi.mock('moment', () => ({
  default: {
    utc: () => ({
      valueOf: () => 1_700_000_000_000,
    }),
  },
}))

const repr = (overrides: Partial<Repr> = {}): Repr => ({
  id: 'r1',
  title: 'Piece',
  categories: [],
  dateCreated: 100,
  datesPracticed: [],
  comment: '',
  learning: false,
  ...overrides,
})

describe('reprs.reducer', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns null initial state for unknown action', () => {
    expect(reducer(undefined, { type: 'unknown' })).toBeNull()
  })

  it('addRepr prepends with generated id and date when missing', () => {
    const payload = repr({ id: undefined as unknown as string, dateCreated: 0 })
    const next = reducer(null, addRepr(payload))
    expect(next).toEqual([
      expect.objectContaining({
        id: 'mock-uuid',
        dateCreated: 1_700_000_000_000,
        title: 'Piece',
      }),
    ])
  })

  it('addRepr keeps provided id and dateCreated', () => {
    const payload = repr({ id: 'existing', dateCreated: 42 })
    const next = reducer([repr({ id: 'other' })], addRepr(payload))
    expect(next?.[0]).toMatchObject({ id: 'existing', dateCreated: 42 })
  })

  it('setReprs replaces state', () => {
    const list = [repr()]
    expect(reducer(null, setReprs(list))).toEqual(list)
  })

  it('clearAllReprs returns empty array', () => {
    expect(reducer([repr()], clearAllReprs())).toEqual([])
  })

  it('resetReprs returns null', () => {
    expect(reducer([repr()], resetReprs())).toBeNull()
  })
})
