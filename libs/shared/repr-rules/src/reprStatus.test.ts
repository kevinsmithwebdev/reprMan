import { describe, expect, it } from 'vitest'
import {
  getReprStatus,
  getReprStatusForRepr,
  groupReprsByStatus,
  ReprStatus,
} from './reprStatus'

describe('reprStatus', () => {
  const settings = { practiceDelay: 10, warningRatio: 0.5 }
  const now = Date.parse('2026-06-01T12:00:00.000Z')

  it('classifies overdue reprs', () => {
    const lastPracticed = now - 11 * 86400000
    expect(getReprStatus(lastPracticed, settings, now)).toBe(ReprStatus.OVERDUE)
  })

  it('returns learning for learning reprs', () => {
    expect(
      getReprStatusForRepr(
        {
          id: '1',
          title: 't',
          categories: [],
          dateCreated: 0,
          datesPracticed: [],
          comment: '',
          learning: true,
        },
        settings,
        now
      )
    ).toBe(ReprStatus.LEARNING)
  })

  it('groups reprs into non-empty sections', () => {
    const sections = groupReprsByStatus(
      [
        {
          id: '1',
          title: 't',
          categories: [],
          dateCreated: 0,
          datesPracticed: [now - 20 * 86400000],
          comment: '',
          learning: false,
        },
      ],
      settings
    )

    expect(sections[0]?.status).toBe(ReprStatus.OVERDUE)
  })
})
