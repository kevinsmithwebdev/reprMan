import type { CategoryFilter, Reprs } from '@reprman/types'
import { getDoesContainsAll } from '@reprman/utilities'

/**
 * Filters the repr list by the active text + category filter values.
 * Pure: returns a new array; does not mutate the input.
 */
export const getFilteredReprs = (reprs: Reprs, filter: CategoryFilter): Reprs =>
  reprs.filter((r) => {
    const passesText = r.title.toLowerCase().includes(filter.text.toLowerCase())

    const checkCategories = filter.categories.length > 0
    const passesCategories =
      !checkCategories || getDoesContainsAll(r.categories, filter.categories)

    return passesText && passesCategories
  })
