import preData from './preData'

const SPAIN_TIME_ZONE = 'Europe/Madrid'
const MIN_HOUR = 10
const MAX_HOUR = 22

const randomFloatInRange = (max, min = 0) => Math.random() * (max - min) + min

const madridHourFormatter = new Intl.DateTimeFormat('en-GB', {
  timeZone: SPAIN_TIME_ZONE,
  hour: 'numeric',
  hourCycle: 'h23',
})

const getMadridHour = (date) => Number(madridHourFormatter.format(date))

const randomTimestampInRange = (fromMs, toMs) =>
  Math.floor(randomFloatInRange(toMs, fromMs))

const isInPracticeHourWindow = (timestampMs) => {
  const hour = getMadridHour(new Date(timestampMs))
  return hour >= MIN_HOUR && hour <= MAX_HOUR
}

const randomPracticeTimestamp = (fromMs, toMs) => {
  let attempts = 0
  while (attempts < 2000) {
    const candidate = randomTimestampInRange(fromMs, toMs)
    if (isInPracticeHourWindow(candidate)) return candidate
    attempts += 1
  }

  throw new Error(
    `Could not generate a Madrid time between ${MIN_HOUR}:00 and ${MAX_HOUR}:00 in the given range.`
  )
}

/**
 * @param {number} numDays
 * @param {Array<{title: string, categories: string[], comment?: string}>} [baseData]
 * @returns {import('@reprman/types').Reprs}
 */
export const generateMockReprs = (numDays, baseData = preData) => {
  if (!Number.isInteger(numDays) || numDays < 0) {
    throw new Error('numDays must be an integer greater than or equal to 0.')
  }

  const nowMs = Date.now()
  const numDaysMs = numDays * 24 * 60 * 60 * 1000
  const rangeStartMs = nowMs - numDaysMs

  return baseData.map((repr, idx) => {
    const practicedAt = randomPracticeTimestamp(rangeStartMs, nowMs)
    const dateCreated = randomTimestampInRange(rangeStartMs, practicedAt)

    return {
      ...repr,
      id: `id-${idx}`,
      comment: repr.comment || '',
      dateCreated,
      datesPracticed: [practicedAt],
    }
  })
}
