import { DEFAULT_DAYS_WARNING, DEFAULT_WARNING_RATIO } from '@reprman/constants'
import { clearAllReprsSAC } from '@reprman/state/sagas/reprs/reprs.actions'
import { saveUserSettingsSAC } from '@reprman/state/sagas/settings'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { getSupplementalSettingsCardData } from './Settings.helpers'

describe('getSupplementalSettingsCardData', () => {
  const dispatch = vi.fn()
  const translate = (key: string) => `t:${key}`

  beforeEach(() => {
    dispatch.mockClear()
  })

  it('returns two supplemental cards with localized copy', () => {
    const cards = getSupplementalSettingsCardData(dispatch, translate)
    expect(cards).toHaveLength(2)
    expect(cards[0].title).toBe('t:pages.settings.resetSettings.title')
    expect(cards[0].subtitle).toBe('t:pages.settings.resetSettings.subtitle')
    expect(cards[0].buttons[0].text).toBe(
      't:pages.settings.resetSettings.button'
    )
    expect(cards[1].title).toBe('t:pages.settings.deleteAllReprs.title')
  })

  it('first card reset button dispatches saveUserSettingsSAC with defaults', () => {
    const cards = getSupplementalSettingsCardData(dispatch, translate)
    cards[0].buttons[0].onClick()
    expect(dispatch).toHaveBeenCalledTimes(1)
    expect(dispatch).toHaveBeenCalledWith(
      saveUserSettingsSAC({
        practiceDelay: DEFAULT_DAYS_WARNING,
        warningRatio: DEFAULT_WARNING_RATIO,
      })
    )
  })

  it('second card delete button dispatches clearAllReprsSAC', () => {
    const cards = getSupplementalSettingsCardData(dispatch, translate)
    cards[1].buttons[0].onClick()
    expect(dispatch).toHaveBeenCalledTimes(1)
    expect(dispatch).toHaveBeenCalledWith(clearAllReprsSAC())
  })
})
