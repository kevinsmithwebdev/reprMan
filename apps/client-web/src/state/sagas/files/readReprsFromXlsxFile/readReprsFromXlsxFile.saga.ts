import LocalizationModule from 'modules/Localization/Localization.module'
import { select, takeLatest, call, put, delay } from 'redux-saga/effects'
import { selectReprs } from 'state/reprs'
import { makeToastSAC } from 'state/sagas/toast/toast.actions'
import Excel from 'exceljs'
import { Reprs, ToastLevel } from 'types'
import {
  getExistingFileHandles,
  getHandledMergeReprs,
  parseReprsXlsxArrayToReprs,
  readFile,
} from 'utilities'
import { storeReprsSAC } from 'state/sagas/reprs/reprs.actions'
import {
  CATEGORIES_OFFSET,
  COMMENT_OFFSET,
  DATE_CREATED_OFFSET,
  DATE_PRACTICED_OFFSET,
  ID_OFFSET,
  TITLE_OFFSET,
  XLSX_FILE_TYPES,
} from '../constants'
import { READ_REPRS_FROM_XLSX_FILE } from '../files.actions'

function* readReprsFromXlsxFileWorker() {
  const { t } = LocalizationModule.getInstance()
  const oldReprs = (yield select(selectReprs)) as Reprs

  try {
    const [fileHandle] = yield call(getExistingFileHandles, XLSX_FILE_TYPES)
    const stream = yield call(readFile, fileHandle)

    const dataArray = yield call(parseXlsxStreamToReprArray, stream)

    const newReprs = yield call(parseReprsXlsxArrayToReprs, dataArray)

    let aggregateReprs = [...oldReprs] as Reprs

    for (let i = 0; i < newReprs.length; i += 1) {
      const indexOfMatchingId = aggregateReprs.findIndex(
        (r) => r.id === newReprs[i].id
      )

      if (indexOfMatchingId !== -1 && !!newReprs[i].id) {
        yield delay(500)
        aggregateReprs = yield call(getHandledMergeReprs, {
          aggregateReprs,
          newRepr: newReprs[i],
          indexOfMatchingId,
        })
      } else {
        aggregateReprs.push(newReprs[i])
      }
    }

    yield put(storeReprsSAC(aggregateReprs))

    yield put(
      makeToastSAC({
        body: t('file.reprReadSuccess', {
          startedCount: oldReprs.length,
          addedCount: aggregateReprs.length - oldReprs.length,
        }),
        level: ToastLevel.SUCCESS,
        delay: 3000,
      })
    )
  } catch (err) {
    yield put(
      makeToastSAC({
        body: `${t('file.reprReadFail')} - ${err}`,
        level: ToastLevel.FAIL,
        delay: 5000,
      })
    )
  }
}

export default [
  takeLatest(READ_REPRS_FROM_XLSX_FILE, readReprsFromXlsxFileWorker),
]

const parseXlsxStreamToReprArray = (stream: Blob) => {
  try {
    return new Promise((resolve, reject) => {
      const workbook = new Excel.Workbook()
      const fileReader = new FileReader()
      fileReader.onload = async (e) => {
        const buffer = e.target.result

        return workbook.xlsx
          .load(buffer as Buffer)
          .then(() => {
            const reprsSheet = workbook.getWorksheet(1)
            const rows = reprsSheet.getRows(2, reprsSheet.rowCount - 1)
            const data = rows.map((row) => [
              row.getCell(TITLE_OFFSET + 1).value,
              row.getCell(CATEGORIES_OFFSET + 1).value,
              row.getCell(COMMENT_OFFSET + 1).value,
              row.getCell(DATE_CREATED_OFFSET + 1).value,
              row.getCell(DATE_PRACTICED_OFFSET + 1).value,
              row.getCell(ID_OFFSET + 1).value,
            ])
            resolve(data)
          })
          .catch((err) => {
            reject(new Error(err))
          })
      }
      fileReader.readAsArrayBuffer(stream)
    })
  } catch (err) {
    throw new Error(`Error parsing spreadsheet: ${err}`)
  }
}
