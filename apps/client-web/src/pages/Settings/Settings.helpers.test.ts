import { clearAllReprsSAC } from '@reprman/state/sagas/reprs/reprs.actions'
import { resetSettingsAC } from '@reprman/state/settings/settings.actions'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const hoisted = vi.hoisted(() => ({
  dispatch: vi.fn(),
}))

vi.mock('@reprman/state/store', () => ({
  default: { dispatch: hoisted.dispatch },
}))

vi.mock('@reprman/localization/Localization.module', () => ({
  default: {
    getInstance: () => ({
      t: (key: string) => `t:${key}`,
    }),
  },
}))

// Imported after mocks so `@reprman/state/store` resolves to the test double.
// eslint-disable-next-line import/first -- vi.mock is hoisted; source must load after factory runs
import { getSupplementalSettingsCardData } from './Settings.helpers'

describe('getSupplementalSettingsCardData', () => {
  beforeEach(() => {
    hoisted.dispatch.mockClear()
  })

  it('returns two supplemental cards with localized copy', () => {
    const cards = getSupplementalSettingsCardData()
    expect(cards).toHaveLength(2)
    expect(cards[0].title).toBe('t:pages.settings.resetSettings.title')
    expect(cards[0].subtitle).toBe('t:pages.settings.resetSettings.subtitle')
    expect(cards[0].buttons[0].text).toBe(
      't:pages.settings.resetSettings.button'
    )
    expect(cards[1].title).toBe('t:pages.settings.deleteAllReprs.title')
  })

  it('first card reset button dispatches resetSettingsAC', () => {
    const cards = getSupplementalSettingsCardData()
    cards[0].buttons[0].onClick()
    expect(hoisted.dispatch).toHaveBeenCalledTimes(1)
    expect(hoisted.dispatch).toHaveBeenCalledWith(resetSettingsAC())
  })

  it('second card delete button dispatches clearAllReprsSAC', () => {
    const cards = getSupplementalSettingsCardData()
    cards[1].buttons[0].onClick()
    expect(hoisted.dispatch).toHaveBeenCalledTimes(1)
    expect(hoisted.dispatch).toHaveBeenCalledWith(clearAllReprsSAC())
  })
})
