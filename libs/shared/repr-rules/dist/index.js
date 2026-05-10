"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.withPracticeApplied = exports.prependPracticeDate = exports.MAX_PRACTICED_DATES = void 0;
/** Hard cap on how many practice timestamps we retain per repr (FIFO trim). */
exports.MAX_PRACTICED_DATES = 100;
/**
 * Returns a new datesPracticed array with `at` (defaulting to `Date.now()`)
 * prepended and trimmed to {@link MAX_PRACTICED_DATES}. Pure: does not mutate
 * the input array.
 */
const prependPracticeDate = (datesPracticed, at = Date.now()) => [at, ...datesPracticed].slice(0, exports.MAX_PRACTICED_DATES);
exports.prependPracticeDate = prependPracticeDate;
/** Returns a new repr with a fresh practice timestamp prepended and trimmed. */
const withPracticeApplied = (repr, at) => ({
    ...repr,
    datesPracticed: (0, exports.prependPracticeDate)(repr.datesPracticed, at),
});
exports.withPracticeApplied = withPracticeApplied;
