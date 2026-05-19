import moment from 'moment'
import { describe, expect, it } from 'vitest'

import { Repr, Settings } from '@reprman/types'
import { ReprStatus } from '@reprman/components/ReprLine/ReprLine.helpers'

import {
  groupReprsForList,
  sortReprsByLastPracticed,
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

describe('sortReprsByLastPracticed', () => {
  it('sorts by most recent practice ascending (least recent first)', () => {
    const older = repr({ id: 'a', datesPracticed: [100] })
    const newer = repr({ id: 'b', datesPracticed: [200] })
    expect(sortReprsByLastPracticed([newer, older])).toEqual([older, newer])
  })
})

describe('groupReprsForList', () => {
  it('puts learning reprs in learningReprs only, not status sections', () => {
    const learning = repr({
      id: 'learn',
      learning: true,
      datesPracticed: [moment().subtract(30, 'days').valueOf()],
    })
    const regular = repr({
      id: 'reg',
      datesPracticed: [moment().subtract(30, 'days').valueOf()],
    })

    const { learningReprs, statusSections } = groupReprsForList(
      [learning, regular],
      settings
    )

    expect(learningReprs.map((r) => r.id)).toEqual(['learn'])
    const statusIds = statusSections.flatMap((s) => s.reprs.map((r) => r.id))
    expect(statusIds).toEqual(['reg'])
    expect(statusIds).not.toContain('learn')
  })

  it('sorts learning reprs by last practiced', () => {
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

    const { learningReprs } = groupReprsForList([b, a], settings)
    expect(learningReprs.map((r) => r.id)).toEqual(['a', 'b'])
  })

  it('groups non-learning reprs by practice status', () => {
    const overdue = repr({
      id: 'o',
      datesPracticed: [moment().subtract(30, 'days').valueOf()],
    })

    const { learningReprs, statusSections } = groupReprsForList(
      [overdue],
      settings
    )

    expect(learningReprs).toHaveLength(0)
    expect(statusSections[0].status).toBe(ReprStatus.OVERDUE)
    expect(statusSections[0].reprs.map((r) => r.id)).toEqual(['o'])
  })
})
