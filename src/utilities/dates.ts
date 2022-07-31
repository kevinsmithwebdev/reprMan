import moment from 'moment'

export const getDateAndFrom = (timeCode: number): string => {
  const lastPracticedMoment = moment(timeCode)
  return `${lastPracticedMoment.format(
    'MMMM Do YYYY, h:mm A'
  )}, ${lastPracticedMoment.fromNow()}`
}

export const getDateDiffText = (first?: number, last?: number): string =>
  !last || !first || first === last
    ? ''
    : moment.duration(last - first).humanize()
