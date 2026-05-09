import { put, takeLatest } from 'redux-saga/effects'
import { clearAllCategoryData } from 'state/categories'
import { resetReprs } from 'state/reprs'
import { resetMaxReprsQuota } from 'state/reprsQuota'
import { loadReprsSAC } from '../reprs/reprs.actions'
import { loadSettingsSAC } from '../settings/settings.actions'
import { RUN_GENESIS, type RunGenesisPayload } from './genesis.actions'

function* runGenesisWorker(action: {
  type: string
  payload?: RunGenesisPayload
}) {
  if (action.payload?.afterSignIn) {
    yield put(clearAllCategoryData())
  }
  yield put(resetReprs())
  yield put(resetMaxReprsQuota())
  yield put(loadReprsSAC())
  yield put(loadSettingsSAC())
}

export default [takeLatest(RUN_GENESIS, runGenesisWorker)]
