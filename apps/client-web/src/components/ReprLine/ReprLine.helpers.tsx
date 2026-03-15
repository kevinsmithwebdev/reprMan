import moment from 'moment'
import { Settings } from 'types'

const SECONDS_IN_A_DAY = 86400

type ReprColor = { className: string; border: string }

export const successReturn = { className: 'success-bg', border: 'success' }
export const warningReturn = { className: 'warning-bg', border: 'warning' }
export const dangerReturn = { className: 'danger-bg', border: 'danger' }

export const getReprColors = (
  lastPracticed: number,
  { practiceDelay, warningRatio }: Settings
): ReprColor => {
  const daysAgo = moment().diff(lastPracticed, 'seconds') / SECONDS_IN_A_DAY

  if (daysAgo > practiceDelay) {
    return dangerReturn
  }

  if (daysAgo > practiceDelay * warningRatio) {
    return warningReturn
  }

  return successReturn
}
