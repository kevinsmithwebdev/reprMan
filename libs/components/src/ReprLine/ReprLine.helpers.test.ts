import { describe, expect, it } from 'vitest'
import {
  isWithinPracticeCooldown,
  PRACTICE_COOLDOWN_MS,
} from '@reprman/shared/repr-rules'
import { Repr } from '@reprman/types'
import {
  dangerReturn,
  getReprColors,
  getReprColorsForRepr,
  learningReturn,
  successReturn,
  warningReturn,
} from './ReprLine.helpers'

const NOW_MS = Date.parse('2020-12-31T00:00:00.000Z')
const MS_IN_A_DAY = 86_400_000

/** Deterministic "practiced N days before NOW_MS" — no wall-clock drift. */
const daysAgoMs = (days: number) => NOW_MS - days * MS_IN_A_DAY

describe('isWithinPracticeCooldown', () => {
  it('is true when practiced less than a minute ago', () => {
    const now = 1_000_000
    expect(
      isWithinPracticeCooldown([now - 30_000], PRACTICE_COOLDOWN_MS, now)
    ).toBe(true)
  })

  it('is false when practiced more than a minute ago', () => {
    const now = 1_000_000
    expect(
      isWithinPracticeCooldown([now - 90_000], PRACTICE_COOLDOWN_MS, now)
    ).toBe(false)
  })

  it('is false when never practiced', () => {
    expect(isWithinPracticeCooldown([])).toBe(false)
  })
})

describe('ReprLine.helpers', () => {
  describe('getReprColors', () => {
    const mockSettings = { practiceDelay: 40, warningRatio: 0.75 }

    it('returns learning gray for learning reprs', () => {
      const learningRepr: Repr = {
        id: '1',
        title: 't',
        categories: [],
        dateCreated: 0,
        datesPracticed: [daysAgoMs(100)],
        comment: '',
        learning: true,
      }
      expect(
        getReprColorsForRepr(learningRepr, mockSettings, NOW_MS)
      ).toStrictEqual(learningReturn)
    })

    it('returns success for 0 days ago', () => {
      expect(getReprColors(daysAgoMs(0), mockSettings, NOW_MS)).toStrictEqual(
        successReturn
      )
    })

    it('returns success halfway between now and warning', () => {
      const daysPassed =
        (mockSettings.practiceDelay * mockSettings.warningRatio) / 2
      expect(
        getReprColors(daysAgoMs(daysPassed), mockSettings, NOW_MS)
      ).toStrictEqual(successReturn)
    })

    it('returns success exactly on the warning boundary (exclusive >)', () => {
      const daysPassed = mockSettings.practiceDelay * mockSettings.warningRatio
      expect(
        getReprColors(daysAgoMs(daysPassed), mockSettings, NOW_MS)
      ).toStrictEqual(successReturn)
    })

    it('returns warning just past the warning boundary', () => {
      const daysPassed =
        mockSettings.practiceDelay * mockSettings.warningRatio + 0.0001
      expect(
        getReprColors(daysAgoMs(daysPassed), mockSettings, NOW_MS)
      ).toStrictEqual(warningReturn)
    })

    it('returns warning halfway between warning and danger', () => {
      const fullPracticeDelay = mockSettings.practiceDelay
      const fullWarning = mockSettings.practiceDelay * mockSettings.warningRatio
      const daysPassed = (fullPracticeDelay + fullWarning) / 2
      expect(
        getReprColors(daysAgoMs(daysPassed), mockSettings, NOW_MS)
      ).toStrictEqual(warningReturn)
    })

    it('returns warning exactly on the danger boundary (exclusive >)', () => {
      expect(
        getReprColors(
          daysAgoMs(mockSettings.practiceDelay),
          mockSettings,
          NOW_MS
        )
      ).toStrictEqual(warningReturn)
    })

    it('returns danger just past the danger boundary', () => {
      const daysPassed = mockSettings.practiceDelay * 1.00001
      expect(
        getReprColors(daysAgoMs(daysPassed), mockSettings, NOW_MS)
      ).toStrictEqual(dangerReturn)
    })

    it('returns danger for 10 days past danger', () => {
      expect(
        getReprColors(
          daysAgoMs(mockSettings.practiceDelay + 10),
          mockSettings,
          NOW_MS
        )
      ).toStrictEqual(dangerReturn)
    })

    it('returns danger for 100 days past danger', () => {
      expect(
        getReprColors(
          daysAgoMs(mockSettings.practiceDelay + 100),
          mockSettings,
          NOW_MS
        )
      ).toStrictEqual(dangerReturn)
    })

    it('returns danger for 1000 days past danger', () => {
      expect(
        getReprColors(
          daysAgoMs(mockSettings.practiceDelay + 1000),
          mockSettings,
          NOW_MS
        )
      ).toStrictEqual(dangerReturn)
    })
  })
})
