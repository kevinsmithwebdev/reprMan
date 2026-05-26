import {
  ReprStatus,
  getReprStatusForRepr,
} from '@reprman/components/ReprLine/ReprLine.helpers'
import { getLastPracticedAt } from '@reprman/shared/repr-rules'
import { Repr, Settings } from '@reprman/types'

export const REPR_STATUS_SECTION_ORDER: ReprStatus[] = [
  ReprStatus.LEARNING,
  ReprStatus.OVERDUE,
  ReprStatus.WARNING,
  ReprStatus.UP_TO_DATE,
]

export interface ReprStatusSection {
  status: ReprStatus
  reprs: Repr[]
}

export const sortReprsByLastPracticedDesc = (reprs: Repr[]): Repr[] =>
  [...reprs].sort(
    (a, b) =>
      getLastPracticedAt(b.datesPracticed) -
      getLastPracticedAt(a.datesPracticed)
  )

export const groupReprsByStatus = (
  reprs: Repr[],
  settings: Settings
): ReprStatusSection[] => {
  const byStatus = new Map<ReprStatus, Repr[]>(
    REPR_STATUS_SECTION_ORDER.map((status) => [status, []])
  )

  reprs.forEach((repr) => {
    const status = getReprStatusForRepr(repr, settings)
    byStatus.get(status)?.push(repr)
  })

  return REPR_STATUS_SECTION_ORDER.map((status) => {
    const sectionReprs = byStatus.get(status) ?? []
    return {
      status,
      reprs:
        status === ReprStatus.LEARNING
          ? sortReprsByLastPracticedDesc(sectionReprs)
          : sectionReprs,
    }
  }).filter((section) => section.reprs.length > 0)
}
