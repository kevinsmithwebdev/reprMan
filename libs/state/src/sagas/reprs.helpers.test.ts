import { describe, expect, it } from 'vitest'
import type { Repr } from '@reprman/types'

import { getAllCategories, mergeCategories } from './reprs.helpers'

const repr = (categories: string[]): Repr => ({
  id: '1',
  title: 't',
  categories,
  dateCreated: 0,
  datesPracticed: [],
  comment: '',
  learning: false,
})

describe('reprs.helpers', () => {
  describe('getAllCategories', () => {
    it('returns sorted unique categories from all reprs', () => {
      const reprs = [repr(['z', 'a']), repr(['b', 'a'])]
      expect(getAllCategories(reprs)).toEqual(['a', 'b', 'z'])
    })

    it('returns empty array when no reprs', () => {
      expect(getAllCategories([])).toEqual([])
    })
  })

  describe('mergeCategories', () => {
    it('merges and deduplicates two category lists', () => {
      expect(mergeCategories(['b', 'a'], ['c', 'a'])).toEqual(['a', 'b', 'c'])
    })

    it('returns sorted unique values when lists overlap', () => {
      expect(mergeCategories(['x'], ['x', 'y'])).toEqual(['x', 'y'])
    })
  })
})
