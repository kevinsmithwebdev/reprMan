import LocalizationModule from 'modules/Localization/Localization.module'
import { select, takeLatest, call, put, delay } from 'redux-saga/effects'
import { selectReprs } from 'state/reprs'
import { makeToastSAC } from 'state/sagas/toast/toast.actions'
import { Reprs, ToastLevel } from 'types'
import { getHandledMergeReprs, parseReprsTextFormat, readFile } from 'utilities'
import { storeReprsSAC } from 'state/sagas/reprs/reprs.actions'
import { READ_LOCAL_REPRS_FILE } from '../files.actions'

function* readLocalReprsFileWorker() {
  const { t } = LocalizationModule.getInstance()
  const oldReprs = (yield select(selectReprs)) as Reprs

  try {
    const text = (yield call(readFile)) as string
    const newReprs = parseReprsTextFormat(text)

    let aggregateReprs = [...oldReprs] as Reprs

    for (let i = 0; i < newReprs.length; i += 1) {
      yield delay(100)
      const indexOfMatchingId = aggregateReprs.findIndex(
        (r) => r.id === newReprs[i].id
      )

      if (indexOfMatchingId !== -1) {
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
        body: t('file.reprReadSuccess'),
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

export default [takeLatest(READ_LOCAL_REPRS_FILE, readLocalReprsFileWorker)]
