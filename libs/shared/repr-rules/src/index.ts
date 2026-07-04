import type { Repr } from '@reprman/shared/repr-model'

/** Hard cap on how many practice timestamps we retain per repr (FIFO trim). */
export const MAX_PRACTICED_DATES = 100

/** Disable "Mark Practiced" briefly after a practice to prevent double-taps. */
export const PRACTICE_COOLDOWN_MS = 60 * 1000

/** Most recent practice timestamp, or 0 when never practiced. */
export const getLastPracticedAt = (datesPracticed: number[]): number =>
  datesPracticed.length ? Math.max(...datesPracticed) : 0

export const isWithinPracticeCooldown = (
  datesPracticed: number[],
  cooldownMs: number = PRACTICE_COOLDOWN_MS,
  now: number = Date.now()
): boolean => {
  const lastPracticed = getLastPracticedAt(datesPracticed)
  return lastPracticed > 0 && now - lastPracticed < cooldownMs
}

/**
 * Returns a new datesPracticed array with `at` (defaulting to `Date.now()`)
 * prepended and trimmed to {@link MAX_PRACTICED_DATES}. Pure: does not mutate
 * the input array.
 */
export const prependPracticeDate = (
  datesPracticed: number[],
  at: number = Date.now()
): number[] => [at, ...datesPracticed].slice(0, MAX_PRACTICED_DATES)

/** Returns a new repr with a fresh practice timestamp prepended and trimmed. */
export const withPracticeApplied = (repr: Repr, at?: number): Repr => ({
  ...repr,
  datesPracticed: prependPracticeDate(repr.datesPracticed, at),
})

export * from './reprStatus'
