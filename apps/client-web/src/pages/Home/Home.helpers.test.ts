import type { CategoryFilter, Repr } from '@reprman/types'

import { getFilteredReprs } from './Home.helpers'

const repr = (overrides: Partial<Repr> = {}): Repr => ({
  id: '1',
  title: 'Alpha',
  comment: 'notes',
  categories: ['cat-a'],
  dateCreated: 0,
  datesPracticed: [],
  learning: false,
  ...overrides,
})

describe('getFilteredReprs', () => {
  const reprs: Repr[] = [
    repr({ id: '1', title: 'Hello', comment: 'world', categories: ['x', 'y'] }),
    repr({ id: '2', title: 'Other', comment: 'nope', categories: ['z'] }),
  ]

  const emptyFilter: CategoryFilter = { text: '', categories: [] }

  it('returns all reprs when filter is empty', () => {
    expect(getFilteredReprs(reprs, emptyFilter)).toEqual(reprs)
  })

  it('filters by title substring (case-insensitive)', () => {
    const filter: CategoryFilter = { text: 'HEL', categories: [] }
    expect(getFilteredReprs(reprs, filter)).toEqual([reprs[0]])
  })

  it('filters by comment substring', () => {
    const filter: CategoryFilter = { text: 'ope', categories: [] }
    expect(getFilteredReprs(reprs, filter)).toEqual([reprs[1]])
  })

  it('when categories set, requires repr to contain all selected categories', () => {
    const filter: CategoryFilter = { text: '', categories: ['x', 'y'] }
    expect(getFilteredReprs(reprs, filter)).toEqual([reprs[0]])
  })

  it('returns empty when no repr matches category filter', () => {
    const filter: CategoryFilter = { text: '', categories: ['x', 'z'] }
    expect(getFilteredReprs(reprs, filter)).toEqual([])
  })
})
