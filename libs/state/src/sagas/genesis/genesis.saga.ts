import { put, takeLatest } from 'redux-saga/effects'
import { clearAllCategoryData } from '@reprman/state/categories'
import { resetReprs } from '@reprman/state/reprs'
import { resetMaxReprsQuota } from '@reprman/state/reprsQuota'
import { loadReprsSAC } from '../reprs/reprs.actions'
import { RUN_GENESIS, type RunGenesisPayload } from './genesis.actions'

export function* runGenesisWorker(action: {
  type: string
  payload?: RunGenesisPayload
}) {
  if (action.payload?.afterSignIn) {
    yield put(clearAllCategoryData())
  }
  yield put(resetReprs())
  yield put(resetMaxReprsQuota())
  yield put(loadReprsSAC())
}

export default [takeLatest(RUN_GENESIS, runGenesisWorker)]
