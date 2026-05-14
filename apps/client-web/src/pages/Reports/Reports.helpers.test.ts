import { Repr } from '@reprman/types'
import { describe, expect, it } from 'vitest'

import {
  formatReprReportLine,
  formatReportsClipboardText,
} from './Reports.helpers'

const repr = (r: Partial<Repr> & Pick<Repr, 'id' | 'title'>): Repr => ({
  categories: [],
  dateCreated: 0,
  datesPracticed: [],
  comment: '',
  ...r,
})

describe('Reports.helpers', () => {
  it('formatReportsClipboardText matches one line per repr, no blank lines', () => {
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
