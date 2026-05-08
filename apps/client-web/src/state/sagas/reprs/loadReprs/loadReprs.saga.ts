import { put, takeLatest } from 'redux-saga/effects'
import { ReprsApiModule } from 'modules'
import { isReprsApiConfigured } from 'modules/ReprsApi'
import { Reprs } from 'types'
import { LOAD_REPRS, storeReprsSAC } from '../reprs.actions'

function* loadReprsWorker() {
  if (!isReprsApiConfigured) {
    yield put(storeReprsSAC([] as Reprs))
    return
  }
  try {
    const reprsApi = ReprsApiModule.getInstance()
    const cloudReprs = (yield reprsApi.listReprs()) as Reprs
    yield put(storeReprsSAC(cloudReprs))
  } catch {
    yield put(storeReprsSAC([] as Reprs))
  }
}

export default [takeLatest(LOAD_REPRS, loadReprsWorker)]
