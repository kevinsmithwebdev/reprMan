import { LocalStorageModule } from 'modules'
import { clearAllReprs } from 'state/reprs'
import { Reprs } from 'types'
import { call, delay, put, takeLatest } from 'redux-saga/effects'
import { clearCategories } from 'state/categories'
import { callConfirmation } from 'modals/Confirmation'
import { CLEAR_ALL_REPRS } from '../reprs.actions'

// @ts-ignore
function* clearAllReprsWorker() {
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

function* clearThemAll() {
  yield put(clearAllReprs())
  yield put(clearCategories())
  yield LocalStorageModule.getInstance().setReprs([] as Reprs)
}
