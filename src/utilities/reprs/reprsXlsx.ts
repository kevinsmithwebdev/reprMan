import Excel from 'exceljs'
import LocalizationModule from 'modules/Localization/Localization.module'
import moment from 'moment'
import { FILE_LINE_DELIMITER } from 'state/sagas/files/constants'
import { Repr, Reprs } from 'types'

export async function makeReprsXlsxFormat(reprs: Reprs) {
  const { t } = LocalizationModule.getInstance()
  const workbook = new Excel.Workbook()
  workbook.title = `Repr Data - created ${moment().toLocaleString()}`
  const reprsWorksheet = workbook.addWorksheet('Reprs')

  reprsWorksheet.columns = [
    { header: 'Title', key: 'title', width: 35 },
    { header: 'Categories', key: 'categories', width: 20 },
    { header: 'Comment', key: 'comment', width: 20 },
    { header: 'Date Created', key: 'dateCreated', width: 25 },
    { header: 'Date Last Practiced', key: 'dateLastPracticed', width: 25 },
    { header: 'id', key: 'id', width: 10 },
  ]

  reprsWorksheet.getRow(1).font = { bold: true }

  reprsWorksheet.views = [{ state: 'frozen', xSplit: 0, ySplit: 1 }]

  reprs.forEach(
    ({ title, categories, comment, dateCreated, datesPracticed, id }) => {
      reprsWorksheet.addRow({
        title,
        categories: categories.join(FILE_LINE_DELIMITER),
        comment,
        dateCreated: dateCreated ? moment(dateCreated).toISOString() : '',
        dateLastPracticed: datesPracticed[0]
          ? moment(datesPracticed[0]).toISOString()
          : '',
        id,
      })
    }
  )

  const infoWorksheet = workbook.addWorksheet('Info')
  const excelInstructions = t('pages.settings.excelFile.info.body', {
    returnObjects: true,
  }) as unknown as string[]
  infoWorksheet.getCell(1, 1).value = excelInstructions.join('\n')

  const buffer = await workbook.xlsx.writeBuffer()

  return new Blob([buffer])
}

export const parseReprsXlsxArrayToReprs = (data: any[]) =>
  data
    .map((reprArray, idx) => {
      if (reprArray.every((el: number) => !el)) return undefined

      const [
        rawTitle,
        rawCategories,
        rawComment,
        rawDateCreated,
        rawLastDatePracticed,
        rawId,
      ] = reprArray

      const title = rawTitle?.trim()

      const errorMessage = `Error parsing row ${idx + 2}, title "${title}"`

      if (!title) {
        throw new Error(`${errorMessage} - title must not be empty.`)
      }
      if (title?.includes(FILE_LINE_DELIMITER)) {
        throw new Error(
          `${errorMessage} - title must not contain asterisk (*).`
        )
      }

      const categories = rawCategories.split(FILE_LINE_DELIMITER)

      const comment = rawComment?.trim()
      if (comment?.includes(FILE_LINE_DELIMITER)) {
        throw new Error(
          `${errorMessage} - comment must not contain asterisk (*).`
        )
      }

      const trimmedRawDateCreated = rawDateCreated?.trim()
      const dateCreated =
        !trimmedRawDateCreated || trimmedRawDateCreated === FILE_LINE_DELIMITER
          ? ''
          : moment(trimmedRawDateCreated).utc().valueOf()
      if (
        !!dateCreated &&
        (typeof dateCreated !== 'number' || Number.isNaN(dateCreated))
      ) {
        throw new Error(
          `${errorMessage} - could not parse "date created" as a date.`
        )
      }

      const trimmedRawLastDatePracticed = rawLastDatePracticed?.trim()
      const lastDatePracticed =
        !trimmedRawLastDatePracticed ||
        trimmedRawLastDatePracticed === FILE_LINE_DELIMITER
          ? ''
          : moment().utc().valueOf()
      if (
        !!lastDatePracticed &&
        (typeof lastDatePracticed !== 'number' ||
          Number.isNaN(lastDatePracticed))
      ) {
        throw new Error(
          `${errorMessage} - could not parse "last date practiced" as a date.`
        )
      }
      const datesPracticed = lastDatePracticed ? [lastDatePracticed] : []

      const trimmedId = rawId?.trim()
      if (trimmedId?.includes(FILE_LINE_DELIMITER)) {
        throw new Error(`${errorMessage} - id must not contain asterisk (*).`)
      }

      const id = trimmedId || ''

      return {
        title,
        categories,
        comment,
        dateCreated,
        datesPracticed,
        id,
      } as unknown as Repr
    })
    .filter((r) => !!r)
