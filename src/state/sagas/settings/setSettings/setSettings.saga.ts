import { LocalStorageModule } from 'modules'
import { put, takeLatest } from 'redux-saga/effects'
import { setSettingsAC } from 'state/settings/settings.actions'
import { Settings } from 'types'
import { SET_SETTINGS } from '../settings.actions'

function* setSettingsWorker({ payload: newSettings }: any) {
  yield put(setSettingsAC(newSettings as Settings))
  yield LocalStorageModule.getInstance().setSettings(newSettings as Settings)
}

export default [takeLatest(SET_SETTINGS, setSettingsWorker)]
