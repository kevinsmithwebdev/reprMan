import type { Repr } from '@reprman/shared/repr-model';
/** Hard cap on how many practice timestamps we retain per repr (FIFO trim). */
export declare const MAX_PRACTICED_DATES = 100;
/**
 * Returns a new datesPracticed array with `at` (defaulting to `Date.now()`)
 * prepended and trimmed to {@link MAX_PRACTICED_DATES}. Pure: does not mutate
 * the input array.
 */
export declare const prependPracticeDate: (datesPracticed: number[], at?: number) => number[];
/** Returns a new repr with a fresh practice timestamp prepended and trimmed. */
export declare const withPracticeApplied: (repr: Repr, at?: number) => Repr;
