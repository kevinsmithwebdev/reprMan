import type { Repr } from '@reprman/shared/repr-model'

const SECONDS_IN_A_DAY = 86400

const getLastPracticedAt = (datesPracticed: number[]): number =>
  datesPracticed.length ? Math.max(...datesPracticed) : 0

export enum ReprStatus {
  LEARNING = 'LEARNING',
  OVERDUE = 'OVERDUE',
  WARNING = 'WARNING',
  UP_TO_DATE = 'UP_TO_DATE',
}

export type PracticeTimingSettings = {
  practiceDelay: number
  warningRatio: number
}

export const REPR_STATUS_SECTION_ORDER: ReprStatus[] = [
  ReprStatus.LEARNING,
  ReprStatus.OVERDUE,
  ReprStatus.WARNING,
  ReprStatus.UP_TO_DATE,
]

export const REPR_STATUS_SECTION_TITLE_KEYS: Record<ReprStatus, string> = {
  [ReprStatus.LEARNING]: 'components.reprsList.sectionLearning',
  [ReprStatus.OVERDUE]: 'components.reprsList.sectionOverdue',
  [ReprStatus.WARNING]: 'components.reprsList.sectionWarning',
  [ReprStatus.UP_TO_DATE]: 'components.reprsList.sectionUpToDate',
}

export type ReprVisualColors = {
  backgroundColor: string
  borderColor: string
}

const visualColorsByStatus: Record<ReprStatus, ReprVisualColors> = {
  [ReprStatus.LEARNING]: {
    backgroundColor: '#f5f5f5',
    borderColor: '#6c757d',
  },
  [ReprStatus.UP_TO_DATE]: {
    backgroundColor: '#b3ffcc',
    borderColor: '#009933',
  },
  [ReprStatus.WARNING]: {
    backgroundColor: '#ffe0b3',
    borderColor: '#ff9900',
  },
  [ReprStatus.OVERDUE]: {
    backgroundColor: '#ffc2b3',
    borderColor: '#ff3300',
  },
}

export const getReprStatus = (
  lastPracticed: number,
  { practiceDelay, warningRatio }: PracticeTimingSettings,
  nowMs: number = Date.now()
): ReprStatus => {
  const daysAgo = (nowMs - lastPracticed) / 1000 / SECONDS_IN_A_DAY

  if (daysAgo > practiceDelay) {
    return ReprStatus.OVERDUE
  }

  if (daysAgo > practiceDelay * warningRatio) {
    return ReprStatus.WARNING
  }

  return ReprStatus.UP_TO_DATE
}

export const getReprStatusForRepr = (
  repr: Repr,
  settings: PracticeTimingSettings,
  nowMs?: number
): ReprStatus => {
  if (repr.learning) {
    return ReprStatus.LEARNING
  }
  return getReprStatus(getLastPracticedAt(repr.datesPracticed), settings, nowMs)
}

export const getReprVisualColorsForRepr = (
  repr: Repr,
  settings: PracticeTimingSettings,
  nowMs?: number
): ReprVisualColors =>
  visualColorsByStatus[getReprStatusForRepr(repr, settings, nowMs)]

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
  settings: PracticeTimingSettings
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
