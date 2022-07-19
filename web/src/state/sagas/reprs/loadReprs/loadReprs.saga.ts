import { put, takeLatest } from 'redux-saga/effects'
import { LocalStorageModule } from 'modules'
import { setReprs } from 'state/reprs'
import { Reprs } from 'types'
import { LOAD_REPRS } from '../reprs.actions'

function* loadReprsWorker() {
  const localStorage = LocalStorageModule.getInstance()

  const reprs = (yield localStorage.getReprs()) as Reprs
  reprs[0].datesPracticed[0] = 1655311551000
  reprs[1].datesPracticed[0] = 1655829951000
  reprs[2].datesPracticed[0] = 1656693951000

  yield put(setReprs(reprs))
}

export default [takeLatest(LOAD_REPRS, loadReprsWorker)]
