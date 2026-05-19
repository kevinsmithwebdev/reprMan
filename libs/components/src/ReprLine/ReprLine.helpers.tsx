import moment from 'moment'
import { getLastPracticedAt } from '@reprman/shared/repr-rules'
import { Repr, Settings } from '@reprman/types'

const SECONDS_IN_A_DAY = 86400

type ReprColor = { className: string; border: string }

export const successReturn = { className: 'success-bg', border: 'success' }
export const warningReturn = { className: 'warning-bg', border: 'warning' }
export const dangerReturn = { className: 'danger-bg', border: 'danger' }
export const learningReturn = { className: 'learning-bg', border: 'secondary' }

export enum ReprStatus {
  LEARNING = 'LEARNING',
  OVERDUE = 'OVERDUE',
  WARNING = 'WARNING',
  UP_TO_DATE = 'UP_TO_DATE',
}

const statusToColors: Record<ReprStatus, ReprColor> = {
  [ReprStatus.LEARNING]: learningReturn,
  [ReprStatus.UP_TO_DATE]: successReturn,
  [ReprStatus.WARNING]: warningReturn,
  [ReprStatus.OVERDUE]: dangerReturn,
}

export const getReprStatus = (
  lastPracticed: number,
  { practiceDelay, warningRatio }: Settings
): ReprStatus => {
  const daysAgo = moment().diff(lastPracticed, 'seconds') / SECONDS_IN_A_DAY

  if (daysAgo > practiceDelay) {
    return ReprStatus.OVERDUE
  }

  if (daysAgo > practiceDelay * warningRatio) {
    return ReprStatus.WARNING
  }

  return ReprStatus.UP_TO_DATE
}

export const getReprStatusForRepr = (repr: Repr, settings: Settings): ReprStatus => {
  if (repr.learning) {
    return ReprStatus.LEARNING
  }
  return getReprStatus(getLastPracticedAt(repr.datesPracticed), settings)
}

export const getReprColorsForRepr = (repr: Repr, settings: Settings): ReprColor =>
  statusToColors[getReprStatusForRepr(repr, settings)]

export const getReprColors = (
  lastPracticed: number,
  settings: Settings
): ReprColor => statusToColors[getReprStatus(lastPracticed, settings)]
