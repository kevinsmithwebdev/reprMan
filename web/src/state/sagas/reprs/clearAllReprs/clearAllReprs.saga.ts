import { put, takeLatest } from 'redux-saga/effects'
import { LocalStorageModule } from 'modules'
import { clearAllReprs } from 'state/reprs'
import { Reprs } from 'types'
import { CLEAR_ALL_REPRS } from '../reprs.actions'

function* clearAllReprsWorker() {
  const localStorage = LocalStorageModule.getInstance()

  yield localStorage.setReprs([] as Reprs)
  yield put(clearAllReprs())
}

  export default [takeLatest(CLEAR_ALL_REPRS, clearAllReprsWorker)]
