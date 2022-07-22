import moment from 'moment'

export const getDateAndFrom = (lastPracticed: number): string => {
  const lastPracticedMoment = moment(lastPracticed)
  return `${lastPracticedMoment.format(
    'MMMM Do YYYY, h:mm a'
  )}, ${lastPracticedMoment.fromNow()}`
}

export const getDateDiff = (first?: number, last?: number): string =>
  !last || !first || first === last
    ? ''
    : moment.duration(last - first).humanize()
