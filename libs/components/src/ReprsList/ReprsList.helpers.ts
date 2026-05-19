import {
  ReprStatus,
  getReprStatus,
} from '@reprman/components/ReprLine/ReprLine.helpers'
import { Repr, Settings } from '@reprman/types'

export const REPR_STATUS_SECTION_ORDER: ReprStatus[] = [
  ReprStatus.OVERDUE,
  ReprStatus.WARNING,
  ReprStatus.UP_TO_DATE,
]

export interface ReprStatusSection {
  status: ReprStatus
  reprs: Repr[]
}

export const sortReprsByLastPracticed = (reprs: Repr[]): Repr[] =>
  [...reprs].sort(
    (a, b) => (a.datesPracticed[0] || 0) - (b.datesPracticed[0] || 0)
  )

export interface ReprsListGrouping {
  learningReprs: Repr[]
  statusSections: ReprStatusSection[]
}

export const groupReprsForList = (
  reprs: Repr[],
  settings: Settings
): ReprsListGrouping => {
  const learningReprs = sortReprsByLastPracticed(
    reprs.filter((repr) => repr.learning)
  )
  const statusReprs = reprs.filter((repr) => !repr.learning)
  const statusSections = groupReprsByStatus(statusReprs, settings)

  return { learningReprs, statusSections }
}

export const groupReprsByStatus = (
  reprs: Repr[],
  settings: Settings
): ReprStatusSection[] => {
  const byStatus = new Map<ReprStatus, Repr[]>(
    REPR_STATUS_SECTION_ORDER.map((status) => [status, []])
  )

  reprs.forEach((repr) => {
    const lastPracticed = repr.datesPracticed[0] || 0
    const status = getReprStatus(lastPracticed, settings)
    byStatus.get(status)!.push(repr)
  })

  return REPR_STATUS_SECTION_ORDER.map((status) => ({
    status,
    reprs: byStatus.get(status)!,
  })).filter((section) => section.reprs.length > 0)
}
