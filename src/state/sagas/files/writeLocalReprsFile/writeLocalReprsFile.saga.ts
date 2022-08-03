import LocalizationModule from 'modules/Localization/Localization.module'
import { select, takeLatest, call, put } from 'redux-saga/effects'
import { selectReprs } from 'state/reprs'
import { makeToastSAC } from 'state/sagas/toast/toast.actions'
import { Reprs, ToastLevel } from 'types'
import { makeReprsTextFormat, writeFile } from 'utilities'
import { WRITE_LOCAL_REPRS_FILE } from '../files.actions'

const FILENAME = 'reprsData.txt'

function* writeLocalReprsFileWorker() {
  const { t } = LocalizationModule.getInstance()
  const reprs = (yield select(selectReprs)) as Reprs
  const reprsTextFormat = makeReprsTextFormat(reprs)
  try {
    yield call(writeFile, FILENAME, reprsTextFormat)
    yield put(
      makeToastSAC({
        body: t('file.reprSaveSuccess'),
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

export default [takeLatest(WRITE_LOCAL_REPRS_FILE, writeLocalReprsFileWorker)]
