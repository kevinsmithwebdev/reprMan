import { describe, expect, it } from 'vitest'

import type { CategoryFilter, Repr } from '@reprman/types'

import { getFilteredReprs } from './reprFilters'

const reprs: Repr[] = [
  {
    id: '1',
    title: 'Alpha',
    comment: 'one',
    categories: ['cat1'],
    datesPracticed: [],
    dateCreated: 0,
    learning: false,
  },
  {
    id: '2',
    title: 'Beta',
    comment: 'two',
    categories: ['cat2'],
    datesPracticed: [],
    dateCreated: 0,
    learning: false,
  },
]

const emptyFilter: CategoryFilter = { text: '', categories: [] }

describe('getFilteredReprs', () => {
  it('returns all reprs when filter is empty', () => {
    expect(getFilteredReprs(reprs, emptyFilter)).toEqual(reprs)
  })

  it('filters by text in title', () => {
    const filter: CategoryFilter = { text: 'alp', categories: [] }
    expect(getFilteredReprs(reprs, filter)).toEqual([reprs[0]])
  })

  it('filters by text in comment', () => {
    const filter: CategoryFilter = { text: 'two', categories: [] }
    expect(getFilteredReprs(reprs, filter)).toEqual([reprs[1]])
  })

  it('filters by category', () => {
    const filter: CategoryFilter = { text: '', categories: ['cat1'] }
    expect(getFilteredReprs(reprs, filter)).toEqual([reprs[0]])
  })

  it('returns empty when no match', () => {
    const filter: CategoryFilter = { text: 'zzz', categories: [] }
    expect(getFilteredReprs(reprs, filter)).toEqual([])
  })
})
