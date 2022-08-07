import LocalizationModule from 'modules/Localization/Localization.module'
import { select, takeLatest, call, put } from 'redux-saga/effects'
import { selectReprs } from 'state/reprs'
import { makeToastSAC } from 'state/sagas/toast/toast.actions'
import { Reprs, ToastLevel } from 'types'
import { getNewFileHandle, makeReprsTextFormat, writeFile } from 'utilities'
import { DEFAULT_REPRS_TEXT_FILENAME, TEXT_FILE_TYPES } from '../constants'
import { WRITE_REPRS_TO_TEXT_FILE } from '../files.actions'

function* writeReprsToTextFileWorker() {
  const { t } = LocalizationModule.getInstance()
  const reprs = (yield select(selectReprs)) as Reprs

  try {
    const fileHandle = yield call(
      getNewFileHandle,
      DEFAULT_REPRS_TEXT_FILENAME,
      TEXT_FILE_TYPES
    )
    const data = yield call(makeReprsTextFormat, reprs)
    yield call(writeFile, fileHandle, data)

    yield put(
      makeToastSAC({
        body: t('file.reprSaveSuccess', { count: reprs.length }),
        level: ToastLevel.SUCCESS,
        delay: 3000,
      })
    )
  } catch (err) {
    console.error(err)

    yield put(
      makeToastSAC({
        body: t('file.reprSaveFail'),
        level: ToastLevel.FAIL,
        delay: 5000,
      })
    )
  }
}

export default [
  takeLatest(WRITE_REPRS_TO_TEXT_FILE, writeReprsToTextFileWorker),
]
