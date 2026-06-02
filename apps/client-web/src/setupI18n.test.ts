import { describe, expect, it } from 'vitest'

describe('setupI18n', () => {
  it('initializes English resources', async () => {
    const i18next = (await import('@reprman/localization/setupI18n')).default
    expect(i18next.t('brand.reprMan')).toBeTruthy()
  })
})
