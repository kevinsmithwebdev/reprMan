import { ReprsApiModule, isReprsApiConfigured } from '@reprman/reprs-api'
import { clearAllReprs } from '@reprman/state/reprs'
import { selectReprs } from '@reprman/state/reprs/reprs.selectors'
import { Reprs, ToastLevel } from '@reprman/types'
import { all, call, delay, put, select, takeLatest } from 'redux-saga/effects'
import { clearCategories } from '@reprman/state/categories'
import { callConfirmation } from '@reprman/modals/Confirmation'
import { makeToastSAC } from '@reprman/state/sagas/toast/toast.actions'
import { CLEAR_ALL_REPRS } from '../reprs.actions'

export function* clearAllReprsWorker() {
  // @ts-ignore
  const isFirstResponseAffirmative = yield call(callConfirmation, {
    title: 'Clear All Reprs Confirmation',
    body: 'Are you sure you want to remove all reprs? This is irreversible.',
  })

  if (!isFirstResponseAffirmative) {
    return
  }

  yield delay(500)

  // @ts-ignore
  const isSecondResponseAffirmative = yield call(callConfirmation, {
    title: 'Clear All Reprs Confirmation, Last Chance',
    body: "Really? Once you clear them, they are gone. Are you sure you want to? Once they're gone, they're gone.",
  })

  if (isSecondResponseAffirmative) {
    yield call(clearThemAll)
  }
}

export default [takeLatest(CLEAR_ALL_REPRS, clearAllReprsWorker)]

export function* clearThemAll() {
  const reprsApi = ReprsApiModule.getInstance()
  const currentReprs = (yield select(selectReprs)) as Reprs
  try {
    if (isReprsApiConfigured) {
      const batchSize = 10
      for (let i = 0; i < currentReprs.length; i += batchSize) {
        const batch = currentReprs.slice(i, i + batchSize)
        yield all(
          batch.map((repr) => call([reprsApi, reprsApi.removeRepr], repr.id))
        )
      }
    }
    yield put(clearAllReprs())
    yield put(clearCategories())
  } catch {
    yield put(
      makeToastSAC({
        body: 'Could not clear all reprs. No changes were applied.',
        level: ToastLevel.FAIL,
        delay: 6000,
      })
    )
  }
}
