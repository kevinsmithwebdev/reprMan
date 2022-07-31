import { getDateDiffText } from 'utilities'

export const getPracticedStr = (datesPracticed: number[]) => {
  const firstPracticed = datesPracticed.at(-1)
  const lastPracticed = datesPracticed.at(0)

  let durationStr
  switch (true) {
    case datesPracticed.length === 0:
      durationStr = 'You have not practiced this repr.'
      break

    case datesPracticed.length === 1:
      durationStr = 'You have only practiced this repr once.'
      break

    case firstPracticed === lastPracticed:
      durationStr = 'There is no difference in your practice times.'
      break

    default:
      durationStr = `You have practiced this repr ${
        datesPracticed.length
      } times over a span of ${getDateDiffText(
        firstPracticed,
        lastPracticed
      )}. That is a rate of ${_getRateOfPracticedStr(datesPracticed)}.`
  }

  return durationStr
}

export const _getRateOfPracticedStr = (datesPracticed: number[]): string => {
  if (!datesPracticed || !datesPracticed.length) return ''

  const firstPracticed = datesPracticed.at(-1)
  const lastPracticed = datesPracticed.at(0)
  const numPracticed = datesPracticed.length

  if (!firstPracticed || !lastPracticed || firstPracticed === lastPracticed)
    return ''

  const diffInHours = (lastPracticed - firstPracticed) / (1000 * 60 * 60)

  if (diffInHours < 1) {
    return `${(numPracticed / diffInHours).toFixed(2)} times per hour`
  }

  const diffInDays = diffInHours / 24

  if (diffInDays < 1) {
    return `${(numPracticed / diffInDays).toFixed(2)} times per day`
  }

  const diffInMonths = diffInDays / 30

  if (diffInMonths < 1) {
    return `${(numPracticed / diffInMonths).toFixed(2)} times per month`
  }

  const diffInYears = diffInDays / 365

  return `${(numPracticed / diffInYears).toFixed(2)} times per year`
}
