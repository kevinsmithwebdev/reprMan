import { describe, expect, it } from 'vitest'

import { SAVE_USER_SETTINGS, saveUserSettingsSAC } from './settings.actions'

describe('settings saga actions', () => {
  it('saveUserSettingsSAC', () => {
    const settings = { practiceDelay: 3, warningRatio: 0.5 }
    expect(saveUserSettingsSAC(settings)).toEqual({
      type: SAVE_USER_SETTINGS,
      payload: settings,
    })
  })
})
