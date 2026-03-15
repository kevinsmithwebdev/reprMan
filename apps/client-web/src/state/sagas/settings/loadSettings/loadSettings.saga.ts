import { put, takeLatest } from 'redux-saga/effects'
import { LocalStorageModule } from 'modules'
import { setSettingsAC } from 'state/settings/settings.actions'
import { Settings } from 'types'
import { LOAD_SETTINGS } from '../settings.actions'

function* loadSettingsWorker() {
  const localStorage = LocalStorageModule.getInstance()

  const settings = (yield localStorage.getSettings()) as Settings
  yield put(setSettingsAC(settings))
}

export default [takeLatest(LOAD_SETTINGS, loadSettingsWorker)]
