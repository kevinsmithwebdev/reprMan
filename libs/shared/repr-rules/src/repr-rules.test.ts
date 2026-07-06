import type { Repr } from '@reprman/shared/repr-model'

import {
  getLastPracticedAt,
  getReprVisualColorsForRepr,
  isWithinPracticeCooldown,
  MAX_PRACTICED_DATES,
  prependPracticeDate,
  PRACTICE_COOLDOWN_MS,
  ReprStatus,
  withPracticeApplied,
} from './index'

const repr = (datesPracticed: number[]): Repr => ({
  id: '1',
  title: 't',
  categories: [],
  dateCreated: 0,
  datesPracticed,
  comment: '',
  learning: false,
})

describe('repr-rules', () => {
  describe('getLastPracticedAt', () => {
    it('returns 0 when never practiced', () => {
      expect(getLastPracticedAt([])).toBe(0)
    })

    it('returns max timestamp', () => {
      expect(getLastPracticedAt([100, 200, 50])).toBe(200)
    })
  })

  describe('prependPracticeDate', () => {
    it('prepends timestamp and trims to max length', () => {
      const existing = Array.from({ length: MAX_PRACTICED_DATES }, (_, i) => i)
      const result = prependPracticeDate(existing, 999)
      expect(result[0]).toBe(999)
      expect(result).toHaveLength(MAX_PRACTICED_DATES)
      expect(result.at(-1)).toBe(MAX_PRACTICED_DATES - 2)
    })

    it('uses Date.now by default', () => {
      const now = 5_000_000
      expect(prependPracticeDate([], now)).toEqual([now])
    })
  })

  describe('withPracticeApplied', () => {
    it('returns repr with updated datesPracticed', () => {
      const at = 42
      expect(withPracticeApplied(repr([1]), at).datesPracticed).toEqual([42, 1])
    })
  })

  describe('isWithinPracticeCooldown', () => {
    it('respects cooldown window', () => {
      const now = 1_000_000
      expect(
        isWithinPracticeCooldown([now - 30_000], PRACTICE_COOLDOWN_MS, now)
      ).toBe(true)
      expect(
        isWithinPracticeCooldown([now - 90_000], PRACTICE_COOLDOWN_MS, now)
      ).toBe(false)
    })

    it('returns false when never practiced', () => {
      expect(isWithinPracticeCooldown([])).toBe(false)
    })

    it('returns false exactly at the cooldown boundary', () => {
      const now = 1_000_000
      expect(
        isWithinPracticeCooldown(
          [now - PRACTICE_COOLDOWN_MS],
          PRACTICE_COOLDOWN_MS,
          now
        )
      ).toBe(false)
    })

    it('supports a custom cooldown duration', () => {
      const now = 1_000_000
      expect(isWithinPracticeCooldown([now - 500], 1_000, now)).toBe(true)
    })
  })

  describe('getReprVisualColorsForRepr', () => {
    it('returns learning colors for learning reprs', () => {
      const colors = getReprVisualColorsForRepr(
        { ...repr([]), learning: true },
        { practiceDelay: 30, warningRatio: 0.5 }
      )
      expect(colors.borderColor).toBe('#6c757d')
    })

    it('returns overdue colors when practice is stale', () => {
      const now = Date.UTC(2024, 5, 1)
      const colors = getReprVisualColorsForRepr(
        repr([now - 40 * 24 * 60 * 60 * 1000]),
        { practiceDelay: 30, warningRatio: 0.5 },
        now
      )
      expect(colors.borderColor).toBe('#ff3300')
      expect(
        getReprVisualColorsForRepr(
          repr([now - 20 * 24 * 60 * 60 * 1000]),
          { practiceDelay: 30, warningRatio: 0.5 },
          now
        ).borderColor
      ).toBe('#ff9900')
      expect(
        getReprVisualColorsForRepr(
          repr([now - 5 * 24 * 60 * 60 * 1000]),
          { practiceDelay: 30, warningRatio: 0.5 },
          now
        ).borderColor
      ).toBe('#009933')
    })
  })
})
