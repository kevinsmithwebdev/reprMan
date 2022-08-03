import { callQuery, ChoiceDatum } from 'modals/Query'
import moment from 'moment'
import { call } from 'redux-saga/effects'
import { Repr, Reprs } from 'types'
import { v4 as uuidv4 } from 'uuid'

const FILE_LINE_DELIMITER = '*'
const FILE_REPR_DELIMITER = '***'

export const makeReprsTextFormat = (reprs: Reprs) =>
  reprs
    .map((r) =>
      [
        r.title,
        r.categories.join(FILE_LINE_DELIMITER) || FILE_LINE_DELIMITER,
        r.comment || FILE_LINE_DELIMITER,
        r.dateCreated
          ? moment(r.dateCreated).utc().toISOString()
          : FILE_LINE_DELIMITER,
        r.datesPracticed[0]
          ? moment(r.datesPracticed[0]).utc().toISOString()
          : FILE_LINE_DELIMITER,
        r.id || FILE_LINE_DELIMITER,
      ].join('\n')
    )
    .join(`\n${FILE_REPR_DELIMITER}\n`)

const TITLE_OFFSET = 0
const CATEGORIES_OFFSET = 1
const COMMENT_OFFSET = 2
const DATE_CREATED_OFFSET = 3
const DATE_PRACTICED_OFFSET = 4
const ID_OFFSET = 5
const DELIMITER_OFFSET = 6

export const parseReprsTextFormat = (text: string): Reprs => {
  const dataLines = text.split('\n')
  const reprs = [] as Reprs

  for (let i = 0; i < dataLines.length; i += 7) {
    const title = dataLines[i + TITLE_OFFSET].trim()
    if (!title) {
      throw new Error(`no title parsed, line: ${i + TITLE_OFFSET + 1}`)
    }
    if (title.includes(FILE_LINE_DELIMITER)) {
      throw new Error(
        `title cannot contain "*", "${title}", line: ${i + TITLE_OFFSET + 1}`
      )
    }

    const categories = dataLines[i + CATEGORIES_OFFSET]
      .trim()
      .split(FILE_LINE_DELIMITER)
      .map((c) => c.trim())

    const rawComment = dataLines[i + COMMENT_OFFSET].trim()
    const comment =
      rawComment === FILE_LINE_DELIMITER || !rawComment ? '' : rawComment
    if (comment.includes(FILE_LINE_DELIMITER)) {
      throw new Error(
        `comment cannot contain "*", "${rawComment}", line: ${
          i + COMMENT_OFFSET + 1
        }`
      )
    }

    const rawDateCreated = dataLines[i + DATE_CREATED_OFFSET].trim()
    const dateCreated =
      rawDateCreated.includes(FILE_LINE_DELIMITER) || !rawDateCreated
        ? moment().utc().valueOf()
        : moment(rawDateCreated).utc().valueOf()
    if (!dateCreated || typeof dateCreated !== 'number') {
      throw new Error(
        `invalid date created, "${rawDateCreated}", line: ${
          i + DATE_CREATED_OFFSET + 1
        }`
      )
    }

    const rawDatePracticed = dataLines[i + DATE_PRACTICED_OFFSET].trim()
    const datesPracticed =
      rawDatePracticed === FILE_LINE_DELIMITER || !rawDatePracticed
        ? []
        : [moment(rawDatePracticed).utc().valueOf()]
    if (datesPracticed.length !== 0 && typeof datesPracticed[0] !== 'number') {
      throw new Error(
        `invalid date practiced, "${rawDatePracticed}", line: ${
          i + DATE_PRACTICED_OFFSET + 1
        }`
      )
    }

    const rawId = dataLines[i + ID_OFFSET].trim()
    const id = rawId.includes(FILE_LINE_DELIMITER) || !rawId ? '' : rawId

    const delimiter = dataLines[i + DELIMITER_OFFSET].trim()
    if (
      i + DELIMITER_OFFSET !== dataLines.length - 1 &&
      delimiter !== FILE_REPR_DELIMITER
    ) {
      throw new Error(
        `incorrect repr delimiter, expected "${FILE_REPR_DELIMITER}", got "${delimiter}", line: ${
          i + DELIMITER_OFFSET + 1
        }`
      )
    }

    const repr = {
      title,
      categories,
      comment,
      dateCreated,
      datesPracticed,
      id,
    } as Repr

    reprs.push(repr)
  }

  return reprs
}

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
