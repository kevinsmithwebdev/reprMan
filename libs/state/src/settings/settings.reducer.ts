import { createReducer } from '@reduxjs/toolkit'
import { DEFAULT_DAYS_WARNING, DEFAULT_WARNING_RATIO } from '@reprman/constants'
import { resetSettingsAC, setSettingsAC } from './settings.actions'
import { Settings } from './settings.types'

const initialState: Settings = {
  practiceDelay: DEFAULT_DAYS_WARNING,
  warningRatio: DEFAULT_WARNING_RATIO,
}

export default createReducer(initialState, (builder) => {
  builder.addCase(resetSettingsAC, () => initialState)
  builder.addCase(setSettingsAC, (state, { payload }) => ({
    ...state,
    ...payload,
  }))
})
