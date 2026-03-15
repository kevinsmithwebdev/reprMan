import LocalizationModule from 'modules/Localization/Localization.module'
import { select, takeLatest, call, put, delay } from 'redux-saga/effects'
import { selectReprs } from 'state/reprs'
import { makeToastSAC } from 'state/sagas/toast/toast.actions'
import { Reprs, ToastLevel } from 'types'
import {
  getExistingFileHandles,
  getHandledMergeReprs,
  parseReprsTextFormat,
  readFile,
} from 'utilities'
import { storeReprsSAC } from 'state/sagas/reprs/reprs.actions'
import { READ_REPRS_FROM_TEXT_FILE } from '../files.actions'
import { TEXT_FILE_TYPES } from '../constants'

function* readReprsFromTextFileWorker() {
  const { t } = LocalizationModule.getInstance()
  const oldReprs = (yield select(selectReprs)) as Reprs

  try {
    const fileHandles = yield call(getExistingFileHandles, TEXT_FILE_TYPES)
    const data = yield call(readFile, fileHandles[0])

    const newReprs = parseReprsTextFormat(data)

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
  takeLatest(READ_REPRS_FROM_TEXT_FILE, readReprsFromTextFileWorker),
]
