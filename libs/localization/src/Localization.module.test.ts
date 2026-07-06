import { describe, expect, it } from 'vitest'

import LocalizationModule from './Localization.module'

describe('LocalizationModule', () => {
  it('returns a singleton with translate and language helpers', async () => {
    const first = LocalizationModule.getInstance()
    const second = LocalizationModule.getInstance()

    expect(first).toBe(second)
    expect(first.t('brand.reprMan')).toBeTruthy()
    expect(first.getLanguage()).toBeTruthy()
    await expect(first.changeLanguage('en')).resolves.toBeTruthy()
  })
})
