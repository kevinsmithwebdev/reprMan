import { put, takeLatest } from 'redux-saga/effects'
import {
  ReprsApiModule,
  isReprsApiConfigured,
  toUserFriendlyApiErrorMessage,
} from '@reprman/reprs-api'
import { setSettingsAC } from '@reprman/state/settings/settings.actions'
import { ToastLevel } from '@reprman/types'
import { makeToastSAC } from '../toast/toast.actions'
import { SAVE_USER_SETTINGS, saveUserSettingsSAC } from './settings.actions'

export function* saveUserSettingsWorker({
  payload,
}: ReturnType<typeof saveUserSettingsSAC>) {
  if (!isReprsApiConfigured) {
    yield put(setSettingsAC(payload))
    return
  }
  try {
    const reprsApi = ReprsApiModule.getInstance()
    const saved = yield reprsApi.updateUserSettings(payload)
    yield put(setSettingsAC(saved))
    yield put(
      makeToastSAC({
        body: 'Settings saved',
        level: ToastLevel.SUCCESS,
        delay: 3000,
      })
    )
  } catch (error: unknown) {
    yield put(
      makeToastSAC({
        body: toUserFriendlyApiErrorMessage(error, 'Could not save settings'),
        level: ToastLevel.FAIL,
        delay: 6000,
      })
    )
  }
}

export default [takeLatest(SAVE_USER_SETTINGS, saveUserSettingsWorker)]
