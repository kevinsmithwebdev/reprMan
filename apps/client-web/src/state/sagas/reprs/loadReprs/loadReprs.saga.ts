import { put, takeLatest } from 'redux-saga/effects'
import { LocalStorageModule, ReprsApiModule } from 'modules'
import { isReprsApiConfigured } from 'modules/ReprsApi'
import { tryMigrateLocalReprsOnce } from 'modules/ReprsApi/reprsMigration'
import { Reprs } from 'types'
import { LOAD_REPRS, storeReprsSAC } from '../reprs.actions'

function* loadReprsWorker() {
  if (!isReprsApiConfigured) {
    const localReprs =
      (yield LocalStorageModule.getInstance().getReprs()) as Reprs
    yield put(storeReprsSAC(localReprs))
    return
  }
  try {
    const reprsApi = ReprsApiModule.getInstance()
    const cloudReprs = (yield reprsApi.listReprs()) as Reprs
    yield tryMigrateLocalReprsOnce(cloudReprs)
    const latestReprs = (yield reprsApi.listReprs()) as Reprs
    yield put(storeReprsSAC(latestReprs))
  } catch {
    yield put(storeReprsSAC([] as Reprs))
  }
}

export default [takeLatest(LOAD_REPRS, loadReprsWorker)]
