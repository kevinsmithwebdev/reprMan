import moment from 'moment'
import { describe, expect, it } from 'vitest'

import { Repr, Settings } from '@reprman/types'
import { ReprStatus } from '@reprman/components/ReprLine/ReprLine.helpers'

import {
  groupReprsByStatus,
  sortReprsByLastPracticedDesc,
} from './ReprsList.helpers'

const settings: Settings = { practiceDelay: 7, warningRatio: 0.5 }

const repr = (overrides: Partial<Repr> = {}): Repr => ({
  id: '1',
  title: 'Title',
  categories: [],
  dateCreated: 0,
  datesPracticed: [],
  comment: '',
  learning: false,
  ...overrides,
})

describe('sortReprsByLastPracticedDesc', () => {
  it('sorts by most recent practice descending (most recent first)', () => {
    const older = repr({ id: 'a', datesPracticed: [100] })
    const newer = repr({ id: 'b', datesPracticed: [200] })
    expect(sortReprsByLastPracticedDesc([older, newer])).toEqual([newer, older])
  })
})

describe('groupReprsByStatus', () => {
  it('puts learning reprs in LEARNING section only', () => {
    const learning = repr({
      id: 'learn',
      learning: true,
      datesPracticed: [moment().subtract(30, 'days').valueOf()],
    })
    const regular = repr({
      id: 'reg',
      datesPracticed: [moment().subtract(30, 'days').valueOf()],
    })

    const sections = groupReprsByStatus([learning, regular], settings)

    expect(sections[0].status).toBe(ReprStatus.LEARNING)
    expect(sections[0].reprs.map((r) => r.id)).toEqual(['learn'])
    const statusIds = sections
      .filter((s) => s.status !== ReprStatus.LEARNING)
      .flatMap((s) => s.reprs.map((r) => r.id))
    expect(statusIds).toEqual(['reg'])
  })

  it('sorts learning reprs by last practiced descending', () => {
    const a = repr({
      id: 'a',
      learning: true,
      datesPracticed: [100],
    })
    const b = repr({
      id: 'b',
      learning: true,
      datesPracticed: [200],
    })

    const sections = groupReprsByStatus([a, b], settings)
    expect(sections[0].reprs.map((r) => r.id)).toEqual(['b', 'a'])
  })

  it('groups non-learning reprs by practice status', () => {
    const overdue = repr({
      id: 'o',
      datesPracticed: [moment().subtract(30, 'days').valueOf()],
    })

    const sections = groupReprsByStatus([overdue], settings)

    expect(sections.some((s) => s.status === ReprStatus.LEARNING)).toBe(false)
    expect(sections[0].status).toBe(ReprStatus.OVERDUE)
    expect(sections[0].reprs.map((r) => r.id)).toEqual(['o'])
  })
})
