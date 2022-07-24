import { put, takeLatest } from 'redux-saga/effects'
import { resetSettingsAC } from 'state/settings/settings.actions'
import { RESET_SETTINGS } from '../settings.actions'

function* resetSettingsWorker() {
  yield put(resetSettingsAC())
}

export default [takeLatest(RESET_SETTINGS, resetSettingsWorker)]
