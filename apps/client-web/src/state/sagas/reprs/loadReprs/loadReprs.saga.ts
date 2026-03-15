import { put, takeLatest } from 'redux-saga/effects'
import { LocalStorageModule } from 'modules'
import { Reprs } from 'types'
import { LOAD_REPRS, storeReprsSAC } from '../reprs.actions'

function* loadReprsWorker() {
  const localStorage = LocalStorageModule.getInstance()

  // eslint-disable-next-line global-require
  // const rawReprs = require('../../../reprs/__FIXTURES__/generatedReprs.json') as Reprs
  const rawReprs = (yield localStorage.getReprs()) as Reprs

  yield put(storeReprsSAC(rawReprs))
}

export default [takeLatest(LOAD_REPRS, loadReprsWorker)]
