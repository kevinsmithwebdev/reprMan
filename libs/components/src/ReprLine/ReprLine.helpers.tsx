import moment from 'moment'
import { Settings } from '@reprman/types'

const SECONDS_IN_A_DAY = 86400

type ReprColor = { className: string; border: string }

export const successReturn = { className: 'success-bg', border: 'success' }
export const warningReturn = { className: 'warning-bg', border: 'warning' }
export const dangerReturn = { className: 'danger-bg', border: 'danger' }

export enum ReprStatus {
  OVERDUE = 'OVERDUE',
  WARNING = 'WARNING',
  UP_TO_DATE = 'UP_TO_DATE',
}

const statusToColors: Record<ReprStatus, ReprColor> = {
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

export const getReprColors = (
  lastPracticed: number,
  settings: Settings
): ReprColor => statusToColors[getReprStatus(lastPracticed, settings)]
