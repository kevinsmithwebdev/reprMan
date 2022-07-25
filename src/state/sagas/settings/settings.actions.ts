import { Settings } from 'types'

export const SET_SETTINGS = 'SAGA/SET_SETTINGS'
export const RESET_SETTINGS = 'SAGA/RESET_SETTINGS'
export const LOAD_SETTINGS = 'SAGA/LOAD_SETTINGS'

export const setSettingsSAC = (payload: Settings) => ({
  type: SET_SETTINGS,
  payload,
})
export const resetSettingsSAC = () => ({ type: RESET_SETTINGS })
export const loadSettingsSAC = () => ({ type: LOAD_SETTINGS })
