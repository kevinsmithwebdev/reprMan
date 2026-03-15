import { callQuery, ChoiceDatum } from 'modals/Query'
import moment from 'moment'
import { call } from 'redux-saga/effects'
import { Repr } from 'types'
import { v4 as uuidv4 } from 'uuid'

const renderReprSimpleTextArray = (repr: Repr) => [
  `Title: ${repr.title}`,
  repr.comment && `Comment: ${repr.comment}`,
  repr.dateCreated &&
    `Created: ${moment(repr.dateCreated).format('MMMM Do YYYY, h:mm A')}`,
  repr.datesPracticed[0] &&
    `Last Practiced: ${moment(repr.datesPracticed[0]).format(
      'MMMM Do YYYY, h:mm A'
    )}`,
]

export function* getHandledMergeReprs({
  aggregateReprs,
  newRepr,
  indexOfMatchingId,
}) {
  const choiceData = [
    { text: 'Keep Previous' },
    { text: 'Keep Incoming', variant: 'dark' },
    { text: 'Keep Both', variant: 'success' },
  ] as ChoiceDatum[]

  const title = 'Duplicate IDs'
  const body = [
    'An incoming repr has the same ID as another. IDs must be unique.',
    'Incoming:',
    ...renderReprSimpleTextArray(newRepr),
    'Previous:',
    ...renderReprSimpleTextArray(aggregateReprs[indexOfMatchingId]),
  ].filter((r) => r) as string[]

  const index = (yield call(callQuery, { title, body, choiceData })) as number

  switch (index) {
    case 0:
      return aggregateReprs
    case 1: {
      const newAggregateReprs = aggregateReprs.slice()
      newAggregateReprs[indexOfMatchingId] = newRepr
      return newAggregateReprs
    }
    default:
      return [...aggregateReprs, { ...newRepr, id: uuidv4() }]
  }
}
