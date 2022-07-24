import { createAction } from '@reduxjs/toolkit'
import { NAMESPACE } from './settings.constants'
import { Settings } from './settings.types'

export const setSettingsAC = createAction<Settings>(`${NAMESPACE}/SET`)
export const resetSettingsAC = createAction(`${NAMESPACE}/RESET`)
