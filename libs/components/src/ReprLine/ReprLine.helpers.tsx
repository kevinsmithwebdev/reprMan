import {
  getReprStatus,
  getReprStatusForRepr,
  ReprStatus,
} from '@reprman/shared/repr-rules'
import { Repr, Settings } from '@reprman/types'

type ReprColor = { className: string; border: string }

export { ReprStatus, getReprStatus, getReprStatusForRepr }

export const successReturn = { className: 'success-bg', border: 'success' }
export const warningReturn = { className: 'warning-bg', border: 'warning' }
export const dangerReturn = { className: 'danger-bg', border: 'danger' }
export const learningReturn = { className: 'learning-bg', border: 'secondary' }

const statusToColors: Record<ReprStatus, ReprColor> = {
  [ReprStatus.LEARNING]: learningReturn,
  [ReprStatus.UP_TO_DATE]: successReturn,
  [ReprStatus.WARNING]: warningReturn,
  [ReprStatus.OVERDUE]: dangerReturn,
}

export const getReprColorsForRepr = (
  repr: Repr,
  settings: Settings
): ReprColor => statusToColors[getReprStatusForRepr(repr, settings)]

export const getReprColors = (
  lastPracticed: number,
  settings: Settings
): ReprColor => statusToColors[getReprStatus(lastPracticed, settings)]
