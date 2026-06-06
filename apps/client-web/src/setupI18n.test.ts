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

  it('loads Portuguese resources', async () => {
    const i18next = (await import('@reprman/localization/setupI18n')).default
    await i18next.changeLanguage('pt')
    expect(i18next.t('pages.home.title')).toBe('Início')
    await i18next.changeLanguage('en')
  })

  it('loads French resources', async () => {
    const i18next = (await import('@reprman/localization/setupI18n')).default
    await i18next.changeLanguage('fr')
    expect(i18next.t('pages.home.title')).toBe('Accueil')
    await i18next.changeLanguage('en')
  })

  it('loads German resources', async () => {
    const i18next = (await import('@reprman/localization/setupI18n')).default
    await i18next.changeLanguage('de')
    expect(i18next.t('pages.home.title')).toBe('Startseite')
    await i18next.changeLanguage('en')
  })

  it('loads Dutch resources', async () => {
    const i18next = (await import('@reprman/localization/setupI18n')).default
    await i18next.changeLanguage('nl')
    expect(i18next.t('pages.home.title')).toBe('Home')
    await i18next.changeLanguage('en')
  })

  it('loads Japanese resources', async () => {
    const i18next = (await import('@reprman/localization/setupI18n')).default
    await i18next.changeLanguage('ja')
    expect(i18next.t('pages.home.title')).toBe('ホーム')
    await i18next.changeLanguage('en')
  })

  it('loads Mandarin resources', async () => {
    const i18next = (await import('@reprman/localization/setupI18n')).default
    await i18next.changeLanguage('zh')
    expect(i18next.t('pages.home.title')).toBe('首页')
    await i18next.changeLanguage('en')
  })

  it('loads Korean resources', async () => {
    const i18next = (await import('@reprman/localization/setupI18n')).default
    await i18next.changeLanguage('ko')
    expect(i18next.t('pages.home.title')).toBe('홈')
    await i18next.changeLanguage('en')
  })

  it('falls back to English when a key is missing in another locale', async () => {
    const i18next = (await import('@reprman/localization/setupI18n')).default
    const key = 'test.fallback.onlyInEnglish'

    i18next.addResource('en', 'translation', key, 'English value')

    await i18next.changeLanguage('es')
    expect(i18next.t(key)).toBe('English value')

    await i18next.changeLanguage('en')
  })
})
