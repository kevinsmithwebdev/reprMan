import { Repr, Reprs } from '@reprman/types'
import { getDoesContainsAll } from '@reprman/utilities'

export function collectSortedUniqueCategories(reprs: Reprs): string[] {
  const set = new Set<string>()
  reprs.forEach((r) => {
    r.categories.forEach((c) => set.add(c))
  })
  return [...set].sort((a, b) =>
    a.localeCompare(b, undefined, { sensitivity: 'base' })
  )
}

export function sortReprsByTitle(reprs: Reprs): Repr[] {
  return [...reprs].sort((a, b) =>
    a.title.localeCompare(b.title, undefined, { sensitivity: 'base' })
  )
}

export function filterReprsByLabels(
  reprs: Reprs,
  selectedLabels: string[]
): Reprs {
  if (!selectedLabels.length) {
    return reprs
  }
  return reprs.filter((r) => getDoesContainsAll(r.categories, selectedLabels))
}

/** One-line text for a repr on the Reports page and in the clipboard. */
export function formatReprReportLine(
  r: Repr,
  includeComments: boolean,
  includeLabels: boolean
): string {
  const parts: string[] = [r.title]
  if (includeComments) {
    const c = r.comment.replace(/\s+/g, ' ').trim()
    if (c) {
      parts.push(c)
    }
  }
  if (includeLabels) {
    const labels =
      r.categories.length > 0
        ? [...r.categories]
            .sort((a, b) =>
              a.localeCompare(b, undefined, { sensitivity: 'base' })
            )
            .join(', ')
        : ''
    if (labels) {
      parts.push(labels)
    }
  }
  return parts.join(' — ')
}

/** Plain text for clipboard: same lines as the visible list, one repr per line. */
export function formatReportsClipboardText(
  reprs: Repr[],
  includeComments: boolean,
  includeLabels: boolean
): string {
  return reprs
    .map((r) => formatReprReportLine(r, includeComments, includeLabels))
    .join('\n')
}
