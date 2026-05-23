import { Settings } from '@reprman/types'

export const SAVE_USER_SETTINGS = 'SAGA/SAVE_USER_SETTINGS'

export const saveUserSettingsSAC = (settings: Settings) => ({
  type: SAVE_USER_SETTINGS,
  payload: settings,
})
