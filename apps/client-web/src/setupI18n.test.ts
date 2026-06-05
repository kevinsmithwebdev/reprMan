import { describe, expect, it } from 'vitest'

describe('setupI18n', () => {
  it('initializes English resources', async () => {
    const i18next = (await import('@reprman/localization/setupI18n')).default
    expect(i18next.t('brand.reprMan')).toBeTruthy()
  })

  it('loads Spanish resources', async () => {
    const i18next = (await import('@reprman/localization/setupI18n')).default
    await i18next.changeLanguage('es')
    expect(i18next.t('pages.home.title')).toBe('Inicio')
    await i18next.changeLanguage('en')
  })
})
