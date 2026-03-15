import moment from 'moment'
import {
  FILE_LINE_DELIMITER,
  FILE_REPR_DELIMITER,
  TITLE_OFFSET,
  CATEGORIES_OFFSET,
  COMMENT_OFFSET,
  DATE_CREATED_OFFSET,
  DATE_PRACTICED_OFFSET,
  ID_OFFSET,
  DELIMITER_OFFSET,
} from 'state/sagas/files/constants'
import { Reprs, Repr } from 'types'

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

export const parseReprsTextFormat = (text: string): Reprs => {
  const dataLines = text.split('\n')
  const reprs = [] as Reprs

  for (let i = 0; i < dataLines.length; i += 7) {
    const title = dataLines[i + TITLE_OFFSET]?.trim()
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
      .map((c) => c?.trim())

    const rawComment = dataLines[i + COMMENT_OFFSET]?.trim()
    const comment =
      rawComment === FILE_LINE_DELIMITER || !rawComment ? '' : rawComment
    if (comment.includes(FILE_LINE_DELIMITER)) {
      throw new Error(
        `comment cannot contain "*", "${rawComment}", line: ${
          i + COMMENT_OFFSET + 1
        }`
      )
    }

    const rawDateCreated = dataLines[i + DATE_CREATED_OFFSET]?.trim()
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

    const rawDatePracticed = dataLines[i + DATE_PRACTICED_OFFSET]?.trim()
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

    const rawId = dataLines[i + ID_OFFSET]?.trim()
    const id = rawId.includes(FILE_LINE_DELIMITER) || !rawId ? '' : rawId

    const isLast = dataLines
      .slice(i + DELIMITER_OFFSET)
      .every((line) => !line.trim() || line.trim() === FILE_REPR_DELIMITER)
    const delimiter = dataLines[i + DELIMITER_OFFSET]?.trim()

    if (!isLast && delimiter !== FILE_REPR_DELIMITER) {
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
    if (isLast) break
  }

  return reprs
}
