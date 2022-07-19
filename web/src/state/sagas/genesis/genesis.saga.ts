import { put, takeLatest } from 'redux-saga/effects'
import { loadReprsSAC } from '../reprs/reprs.actions'
import {RUN_GENESIS} from './genesis.actions'

function* runGenesisWorker() {
  yield put(loadReprsSAC())
}

export default [takeLatest(RUN_GENESIS, runGenesisWorker)]
