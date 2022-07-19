import { put, takeLatest } from 'redux-saga/effects'
import { LocalStorageModule } from 'modules'
import { setReprs } from 'state/reprs'
import { Reprs } from 'types'
import { LOAD_REPRS } from '../reprs.actions'

function* loadReprsWorker() {
  const localStorage = LocalStorageModule.getInstance()

  const reprs = (yield localStorage.getReprs()) as Reprs
  yield put(setReprs(reprs))
}

  export default [takeLatest(LOAD_REPRS, loadReprsWorker)]
