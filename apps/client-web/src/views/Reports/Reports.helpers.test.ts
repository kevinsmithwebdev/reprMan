import { describe, expect, it } from 'vitest'

import { testRepr } from '../../test-utils'
import {
  collectSortedUniqueCategories,
  filterReprsByLabels,
  formatReprReportLine,
  formatReportsClipboardText,
  sortReprsByTitle,
} from './Reports.helpers'

describe('Reports.helpers', () => {
  const reprA = testRepr({
    id: 'a',
    title: 'Alpha',
    categories: ['music', 'jazz'],
    comment: '  spaced\ncomment  ',
  })
  const reprB = testRepr({
    id: 'b',
    title: 'beta',
    categories: ['theatre'],
    comment: '',
  })

  it('collects sorted unique categories', () => {
    expect(collectSortedUniqueCategories([reprA, reprB])).toEqual([
      'jazz',
      'music',
      'theatre',
    ])
  })

  it('sorts reprs by title case-insensitively', () => {
    expect(sortReprsByTitle([reprA, reprB]).map((r) => r.id)).toEqual([
      'a',
      'b',
    ])
  })

  it('filters reprs by selected labels', () => {
    expect(filterReprsByLabels([reprA, reprB], [])).toHaveLength(2)
    expect(
      filterReprsByLabels([reprA, reprB], ['jazz']).map((r) => r.id)
    ).toEqual(['a'])
  })

  it('formats report lines and clipboard text', () => {
    expect(formatReprReportLine(reprA, false, false)).toBe('Alpha')
    expect(formatReprReportLine(reprA, true, true)).toBe(
      'Alpha — spaced comment — jazz, music'
    )
    expect(formatReprReportLine(reprB, true, true)).toBe('beta — theatre')
    expect(formatReportsClipboardText([reprA, reprB], true, false)).toBe(
      'Alpha — spaced comment\nbeta'
    )
  })
})
