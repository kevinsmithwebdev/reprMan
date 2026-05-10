import { all, put, takeLatest } from 'redux-saga/effects'
import { ReprsApiModule, isReprsApiConfigured } from '@reprman/reprs-api'
import { resetMaxReprsQuota, setMaxReprsQuota } from '@reprman/state/reprsQuota'
import { Reprs } from '@reprman/types'
import { LOAD_REPRS, storeReprsSAC } from '../reprs.actions'

function* loadReprsWorker() {
  if (!isReprsApiConfigured) {
    yield put(resetMaxReprsQuota())
    yield put(storeReprsSAC([] as Reprs))
    return
  }
  try {
    const reprsApi = ReprsApiModule.getInstance()
    const [cloudReprs, { maxReprsAllowed }] = yield all([
      reprsApi.listReprs(),
      reprsApi.getUserConfig(),
    ])
    yield put(setMaxReprsQuota(maxReprsAllowed))
    yield put(storeReprsSAC(cloudReprs as Reprs))
  } catch {
    yield put(resetMaxReprsQuota())
    yield put(storeReprsSAC([] as Reprs))
  }
}

export default [takeLatest(LOAD_REPRS, loadReprsWorker)]
