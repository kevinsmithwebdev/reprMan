import { Repr } from '@reprman/types'
import { describe, expect, it } from 'vitest'

import {
  collectSortedUniqueCategories,
  filterReprsByLabels,
  formatReprReportLine,
  formatReportsClipboardText,
  sortReprsByTitle,
} from './Reports.helpers'

const repr = (r: Partial<Repr> & Pick<Repr, 'id' | 'title'>): Repr => ({
  categories: [],
  dateCreated: 0,
  datesPracticed: [],
  comment: '',
  learning: false,
  ...r,
})

describe('Reports.helpers', () => {
  describe('collectSortedUniqueCategories', () => {
    it('returns sorted unique categories across reprs', () => {
      const reprs = [
        repr({ id: '1', title: 'a', categories: ['z', 'a'] }),
        repr({ id: '2', title: 'b', categories: ['b', 'a'] }),
      ]
      expect(collectSortedUniqueCategories(reprs)).toEqual(['a', 'b', 'z'])
    })

    it('returns empty array when no categories', () => {
      expect(collectSortedUniqueCategories([])).toEqual([])
    })
  })

  describe('sortReprsByTitle', () => {
    it('sorts reprs by title case-insensitively', () => {
      const reprs = [
        repr({ id: '1', title: 'banana' }),
        repr({ id: '2', title: 'Apple' }),
      ]
      expect(sortReprsByTitle(reprs).map((r) => r.title)).toEqual([
        'Apple',
        'banana',
      ])
    })
  })

  describe('filterReprsByLabels', () => {
    const reprs = [
      repr({ id: '1', title: 'a', categories: ['x', 'y'] }),
      repr({ id: '2', title: 'b', categories: ['z'] }),
    ]

    it('returns all reprs when no labels selected', () => {
      expect(filterReprsByLabels(reprs, [])).toEqual(reprs)
    })

    it('filters reprs that contain all selected labels', () => {
      expect(filterReprsByLabels(reprs, ['x', 'y'])).toEqual([reprs[0]])
    })
  })

  describe('formatReprReportLine', () => {
    it('includes title only when flags are false', () => {
      const r = repr({
        id: '1',
        title: 'Title',
        comment: 'note',
        categories: ['a'],
      })
      expect(formatReprReportLine(r, false, false)).toBe('Title')
    })

    it('includes trimmed comment when includeComments is true', () => {
      const r = repr({
        id: '1',
        title: 'Title',
        comment: '  multi\n  line  ',
      })
      expect(formatReprReportLine(r, true, false)).toBe('Title — multi line')
    })

    it('skips empty comment', () => {
      const r = repr({ id: '1', title: 'Title', comment: '   ' })
      expect(formatReprReportLine(r, true, false)).toBe('Title')
    })

    it('includes sorted labels when includeLabels is true', () => {
      const r = repr({ id: '1', title: 'Title', categories: ['z', 'a'] })
      expect(formatReprReportLine(r, false, true)).toBe('Title — a, z')
    })

    it('skips labels section when categories empty', () => {
      const r = repr({ id: '1', title: 'Title' })
      expect(formatReprReportLine(r, false, true)).toBe('Title')
    })
  })

  describe('formatReportsClipboardText', () => {
    it('matches one line per repr, no blank lines', () => {
      const rows = [
        repr({ id: '1', title: 'B', comment: 'x' }),
        repr({ id: '2', title: 'A', categories: ['x', 'y'], comment: '' }),
      ]
      const text = formatReportsClipboardText(rows, true, true)
      expect(text).toBe(
        [
          formatReprReportLine(rows[0], true, true),
          formatReprReportLine(rows[1], true, true),
        ].join('\n')
      )
      expect(text).not.toContain('\n\n')
    })
  })
})
