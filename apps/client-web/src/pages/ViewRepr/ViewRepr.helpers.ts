import { getDateDiffText } from '@reprman/utilities'

type TranslateFn = (key: string, props?: object) => string

export const getPracticedStr = (datesPracticed: number[], t: TranslateFn) => {
  const firstPracticed = datesPracticed.at(-1)
  const lastPracticed = datesPracticed.at(0)

  let durationStr
  switch (true) {
    case datesPracticed.length === 0:
      durationStr = t('pages.viewRepr.practice.never')
      break

    case datesPracticed.length === 1:
      durationStr = t('pages.viewRepr.practice.once')
      break

    case firstPracticed === lastPracticed:
      durationStr = t('pages.viewRepr.practice.noDifference')
      break

    default:
      durationStr = t('pages.viewRepr.practice.summary', {
        count: datesPracticed.length,
        span: getDateDiffText(firstPracticed, lastPracticed),
        rate: _getRateOfPracticedStr(datesPracticed, t),
      })
  }

  return durationStr
}

export const _getRateOfPracticedStr = (
  datesPracticed?: number[] | null,
  t?: TranslateFn
): string => {
  if (!datesPracticed?.length || !t) return ''

  const firstPracticed = datesPracticed.at(-1)
  const lastPracticed = datesPracticed.at(0)
  const numPracticed = datesPracticed.length

  if (!firstPracticed || !lastPracticed || firstPracticed === lastPracticed)
    return ''

  const diffInHours = (lastPracticed - firstPracticed) / (1000 * 60 * 60)

  if (diffInHours < 1) {
    return t('pages.viewRepr.practice.ratePerHour', {
      rate: (numPracticed / diffInHours).toFixed(2),
    })
  }

  const diffInDays = diffInHours / 24

  if (diffInDays < 1) {
    return t('pages.viewRepr.practice.ratePerDay', {
      rate: (numPracticed / diffInDays).toFixed(2),
    })
  }

  const diffInMonths = diffInDays / 30

  if (diffInMonths < 1) {
    return t('pages.viewRepr.practice.ratePerMonth', {
      rate: (numPracticed / diffInMonths).toFixed(2),
    })
  }

  const diffInYears = diffInDays / 365

  return t('pages.viewRepr.practice.ratePerYear', {
    rate: (numPracticed / diffInYears).toFixed(2),
  })
}
