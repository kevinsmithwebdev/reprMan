import { describe, expect, it } from 'vitest'
import { DEFAULT_DAYS_WARNING, DEFAULT_WARNING_RATIO } from '@reprman/constants'

import reducer from './settings.reducer'
import { resetSettingsAC, setSettingsAC } from './settings.actions'

const initialState = {
  practiceDelay: DEFAULT_DAYS_WARNING,
  warningRatio: DEFAULT_WARNING_RATIO,
}

describe('settings.reducer', () => {
  it('returns initial state for unknown action', () => {
    expect(reducer(undefined, { type: 'unknown' })).toEqual(initialState)
  })

  it('setSettingsAC merges partial settings', () => {
    const next = reducer(
      initialState,
      setSettingsAC({ practiceDelay: 5, warningRatio: DEFAULT_WARNING_RATIO })
    )
    expect(next).toEqual({ ...initialState, practiceDelay: 5 })
  })

  it('resetSettingsAC restores defaults', () => {
    const state = { practiceDelay: 99, warningRatio: 0.5 }
    expect(reducer(state, resetSettingsAC())).toEqual(initialState)
  })
})
