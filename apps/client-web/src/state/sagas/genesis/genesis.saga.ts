import { put, takeLatest } from 'redux-saga/effects'
import { loadReprsSAC } from '../reprs/reprs.actions'
import { loadSettingsSAC } from '../settings/settings.actions'
import { RUN_GENESIS } from './genesis.actions'

function* runGenesisWorker() {
  yield put(loadReprsSAC())
  yield put(loadSettingsSAC())
}

export default [takeLatest(RUN_GENESIS, runGenesisWorker)]
