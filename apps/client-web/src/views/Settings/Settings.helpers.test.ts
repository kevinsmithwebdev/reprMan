import { describe, expect, it, vi } from 'vitest'

import { clearAllReprsSAC } from '@reprman/state/sagas/reprs/reprs.actions'
import { saveUserSettingsSAC } from '@reprman/state/sagas/settings'

import { getSupplementalSettingsCardData } from './Settings.helpers'

describe('Settings.helpers', () => {
  it('builds supplemental cards that dispatch reset and delete actions', () => {
    const dispatch = vi.fn()
    const cards = getSupplementalSettingsCardData(dispatch, (key) => key)

    expect(cards).toHaveLength(2)
    cards[0].buttons[0].onClick()
    cards[1].buttons[0].onClick()

    expect(dispatch).toHaveBeenCalledWith(
      saveUserSettingsSAC({
        practiceDelay: expect.any(Number),
        warningRatio: expect.any(Number),
      })
    )
    expect(dispatch).toHaveBeenCalledWith(clearAllReprsSAC())
  })
})
