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
