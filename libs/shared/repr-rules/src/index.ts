import type { Repr } from '@reprman/shared/repr-model'

/** Hard cap on how many practice timestamps we retain per repr (FIFO trim). */
export const MAX_PRACTICED_DATES = 100

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
